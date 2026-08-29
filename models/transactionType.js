import mongoose from "mongoose";
import { classificationRuleSchema } from "./classificationRule.js";

const transactionTypeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		rules: {
			type: [classificationRuleSchema],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

export const TransactionType = mongoose.model("TransactionType", transactionTypeSchema);
export default TransactionType;
