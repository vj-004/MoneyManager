import { Transaction } from "../models/transaction.js";
import { returnResponse } from "../utils/specialUtils.js";

const allowedUpdateFields = [
	"customDescription",
	"category",
	"tag",
	"type",
	"splits",
];

export const sanitizeTransactionUpdate = (payload = {}) => {
	const sanitized = {};

	for (const field of allowedUpdateFields) {
		if (Object.prototype.hasOwnProperty.call(payload, field)) {
			sanitized[field] = payload[field];
		}
	}

	return sanitized;
};

export const getAllTransactions = async (req, res) => {
	try {
		const page = Math.max(1, Number(req.query.page) || 1);
		const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
		const totalTransactions = await Transaction.countDocuments({});
		const totalPages = Math.max(1, Math.ceil(totalTransactions / limit));

		if (page > totalPages) {
			return returnResponse(
				res,
				400,
				false,
				"Page number exceeds the total number of pages available",
				{
					page,
					limit,
					totalTransactions,
					totalPages,
				}
			);
		}

		const skip = (page - 1) * limit;
		const transactions = await Transaction.find({})
			.populate("category tag type")
			.sort({ transactionDate: -1, createdAt: -1 })
			.skip(skip)
			.limit(limit);

		return returnResponse(res, 200, true, "Transactions fetched successfully", {
			transactions,
			page,
			limit,
			totalTransactions,
			totalPages,
		});
	} catch (error) {
		console.error("Error fetching transactions:", error);
		return returnResponse(res, 500, false, "Failed to fetch transactions");
	}
};

export const getTransactionById = async (req, res) => {
	const { id } = req.params;

	try {
		const transaction = await Transaction.findById(id).populate("category tag type");

		if (!transaction) {
			return returnResponse(res, 404, false, "Transaction not found");
		}

		return returnResponse(res, 200, true, "Transaction fetched successfully", transaction);
	} catch (error) {
		console.error("Error fetching transaction by id:", error);

		if (error?.name === "CastError") {
			return returnResponse(res, 400, false, "Invalid transaction id");
		}

		return returnResponse(res, 500, false, "Failed to fetch transaction");
	}
};

export const updateTransaction = async (req, res) => {
	const { id } = req.params;
	const updates = sanitizeTransactionUpdate(req.body || {});

	if (Object.keys(updates).length === 0) {
		return returnResponse(res, 400, false, "No valid transaction fields were provided for update");
	}

	try {
		const existingTransaction = await Transaction.findById(id);

		if (!existingTransaction) {
			return returnResponse(res, 404, false, "Transaction not found");
		}

		const updatedTransaction = await Transaction.findByIdAndUpdate(
			id,
			{ $set: updates },
			{ new: true, runValidators: true }
		).populate("category tag type");

		if (!updatedTransaction) {
			return returnResponse(res, 404, false, "Transaction not found");
		}

		return returnResponse(res, 200, true, "Transaction updated successfully", updatedTransaction);
	} catch (error) {
		console.error("Error updating transaction:", error);

		if (error?.name === "CastError") {
			return returnResponse(res, 400, false, "Invalid transaction id");
		}

		if (error?.code === 11000) {
			return returnResponse(res, 409, false, "A transaction with the same unique data already exists");
		}

		return returnResponse(res, 500, false, "Failed to update transaction");
	}
};
