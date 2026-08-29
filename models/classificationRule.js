import mongoose from "mongoose";

export const classificationRuleSchema = new mongoose.Schema(
	{
		field: {
			type: String,
			enum: ["description", "reference"],
			required: true,
		},
		operator: {
			type: String,
			enum: ["contains", "equals", "regex"],
			default: "contains",
		},
		value: {
			type: String,
			required: true,
			trim: true,
		},
		priority: {
			type: Number,
			default: 0,
		},
		enabled: {
			type: Boolean,
			default: true,
		},
	},
	{ _id: true }
);
