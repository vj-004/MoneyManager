import mongoose from "mongoose";
import { classificationRuleSchema } from "./classificationRule.js";

const tagSchema = new mongoose.Schema(
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

export const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
