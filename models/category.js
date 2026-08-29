import mongoose from "mongoose";
import { classificationRuleSchema } from "./classificationRule.js";

const categorySchema = new mongoose.Schema(
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

export const Category = mongoose.model("Category", categorySchema);
export default Category;