import mongoose from "mongoose";

const transactionTypeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

export const TransactionType = mongoose.model("TransactionType", transactionTypeSchema);
export default TransactionType;
