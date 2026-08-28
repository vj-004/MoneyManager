import fs from "fs";
import crypto from "crypto";
import csv from "csv-parser";
import { Transaction } from "../models/transaction.js";
import { User } from "../models/user.js";
import Category from "../models/category.js";
import Tag from "../models/tag.js";
import TransactionType from "../models/transactionType.js";
import { classifyTransaction } from "../utils/transactionClassifier.js";
import { returnResponse } from "../utils/specialUtils.js";

const parseAmount = (value) => (value ? value.replaceAll(",", "").trim() : "0.00");

const getStatementDates = (rows) => {
	const dates = rows.map((row) => new Date(row.transactionDate));
	return {
		startDate: new Date(Math.min(...dates)),
		endDate: new Date(Math.max(...dates)),
	};
};

const toCents = (value) => {
	const [whole, fraction = ""] = value.split(".");
	const sign = whole.startsWith("-") ? -1n : 1n;
	const absoluteWhole = whole.replace("-", "");
	return sign * (BigInt(absoluteWhole || "0") * 100n + BigInt(fraction.padEnd(2, "0").slice(0, 2)));
};

const fromCents = (cents) => {
	const sign = cents < 0n ? "-" : "";
	const absoluteCents = cents < 0n ? -cents : cents;
	return `${sign}${absoluteCents / 100n}.${(absoluteCents % 100n).toString().padStart(2, "0")}`;
};

const getOrCreateLookup = (Model, name) => Model.findOneAndUpdate(
	{ name },
	{ $setOnInsert: { name } },
	{ upsert: true, new: true, setDefaultsOnInsert: true }
);

const createTransactionHash = (transaction) => {
	const hashInput = [
		transaction.transactionDate,
		transaction.valueDate,
		transaction.chequeNoReferenceNo,
		transaction.description,
		transaction.withdrawals,
		transaction.deposits,
		transaction.runningBalance,
	].join("|");

	return crypto.createHash("sha256").update(hashInput).digest("hex");
};

export const uploadStatement = async (req, res) => {
	const uploadedFile = req.files?.statement;

	if (!uploadedFile) {
		return returnResponse(res, 400, false, "CSV file is required");
	}

	if (!uploadedFile.name.toLowerCase().endsWith(".csv")) {
		return returnResponse(res, 400, false, "Only CSV files are supported");
	}

	try {
		const statementKey = crypto.randomUUID();
		const rows = [];

		await new Promise((resolve, reject) => {
			fs.createReadStream(uploadedFile.tempFilePath)
				.pipe(csv())
				.on("data", (row) => {
					const withdrawal = parseAmount(row.Withdrawals);
					const deposit = parseAmount(row.Deposits);

					rows.push({
						transactionDate: row["Transaction Date"],
						valueDate: row["Value Date"],
						chequeNoReferenceNo: row["Cheque No/Reference No"].trim(),
						description: row.Description.trim(),
						withdrawals: withdrawal,
						deposits: deposit,
						runningBalance: parseAmount(row["Running Balance"]),
					});
				})
				.on("end", resolve)
				.on("error", reject);
		});

		if (rows.length === 0) {
			return returnResponse(res, 400, false, "CSV file contains no transactions");
		}

		const transactions = await Promise.all(rows.map(async (row) => {
			const { category, tag, type } = classifyTransaction(row);
			const [categoryDocument, tagDocument, typeDocument] = await Promise.all([
				getOrCreateLookup(Category, category),
				getOrCreateLookup(Tag, tag),
				getOrCreateLookup(TransactionType, type),
			]);
			const transaction = {
				...row,
				category,
				tag,
				type,
			};

			return {
				...transaction,
				category: categoryDocument._id,
				tag: tagDocument._id,
				type: typeDocument._id,
				statementKey,
				hash: createTransactionHash(transaction),
			};
		}));

		const { startDate, endDate } = getStatementDates(rows);
		const openingRow = rows.reduce((earliest, row) => (
			new Date(row.transactionDate) < new Date(earliest.transactionDate) ? row : earliest
		));
		const closingRow = rows.reduce((latest, row) => (
			new Date(row.transactionDate) > new Date(latest.transactionDate) ? row : latest
		));
		const openingBalance = fromCents(
			toCents(openingRow.runningBalance)
			- toCents(openingRow.deposits)
			+ toCents(openingRow.withdrawals)
		);

		let savedTransactions;

		try {
			savedTransactions = await Transaction.insertMany(transactions, {
				ordered: false,
			});
		} catch (error) {
			if (error.code !== 11000) {
				throw new Error("Failed to insert transactions into the database", {
					cause: error,
				});
			}

			savedTransactions = error.insertedDocs || [];
		}

		const user = await User.findOneAndUpdate(
			{},
			{
				$set: { totalBalance: closingRow.runningBalance },
				$push: {
					imports: {
						key: statementKey,
						fileName: uploadedFile.name,
						openingBalance,
						closingBalance: closingRow.runningBalance,
						startDate,
						endDate,
						transactionCount: savedTransactions.length,
					},
				},
			},
			{ upsert: true, new: true, runValidators: true }
		);

		return returnResponse(
			res,
			201,
			true,
			savedTransactions.length === transactions.length
				? "Transactions imported successfully"
				: "Transactions imported; duplicate transactions were skipped",
			{
				count: savedTransactions.length,
				skipped: transactions.length - savedTransactions.length,
				statementKey,
			}
		);
	} catch (error) {
		console.error("Error importing account statement:", error);
		return returnResponse(res, 500, false, "Failed to import account statement");
	} finally {
		if (uploadedFile.tempFilePath) {
			await fs.promises.unlink(uploadedFile.tempFilePath).catch(() => {});
		}
	}
};
