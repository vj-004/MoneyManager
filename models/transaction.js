import mongoose from "mongoose";

const splitSchema = new mongoose.Schema(
	{
		amount: {
			type: mongoose.Schema.Types.Decimal128,
			required: true,
			min: 0,
		},
		customDescription: {
			type: String,
			trim: true,
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
		},
		tag: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Tag",
		},
		type: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "TransactionType",
		},
	},
	{ _id: true, timestamps: true }
);

const paymentDetailsSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			enum: ["UPI", "NEFT", "UNKNOWN"],
			default: "UNKNOWN",
		},
		fromAddress: {
			type: String,
			trim: true,
		},
		toAddress: {
			type: String,
			trim: true,
		},
		counterpartyName: {
			type: String,
			trim: true,
		},
		bankCode: {
			type: String,
			trim: true,
		},
		reference: {
			type: String,
			trim: true,
		},
		raw: {
			type: String,
			trim: true,
		},
	},
	{ _id: false }
);

const transactionSchema = new mongoose.Schema(
	{
		transactionDate: {
			type: Date,
			required: true,
		},
		valueDate: {
			type: Date,
			required: true,
		},
		chequeNoReferenceNo: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		customDescription: {
			type: String,
			trim: true,
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
		},
		tag: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Tag",
		},
		type: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "TransactionType",
		},
		paymentDetails: {
			type: paymentDetailsSchema,
			default: {},
		},
		hash: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		statementKey: {
			type: String,
			required: true,
		},
		splits: {
			type: [splitSchema],
			default: [],
		},
		withdrawals: {
			type: mongoose.Schema.Types.Decimal128,
			default: "0.00",
			min: 0,
		},
		deposits: {
			type: mongoose.Schema.Types.Decimal128,
			default: "0.00",
			min: 0,
		},
		runningBalance: {
			type: mongoose.Schema.Types.Decimal128,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
