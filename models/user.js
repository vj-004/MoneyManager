import mongoose from "mongoose";

const statementImportSchema = new mongoose.Schema(
	{
		key: {
			type: String,
			required: true,
		},
		fileName: {
			type: String,
			required: true,
		},
		openingBalance: {
			type: mongoose.Schema.Types.Decimal128,
		},
		closingBalance: {
			type: mongoose.Schema.Types.Decimal128,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		transactionCount: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{ _id: false, timestamps: true }
);

const userSchema = new mongoose.Schema(
	{
		totalBalance: {
			type: mongoose.Schema.Types.Decimal128,
			default: "0.00",
		},
		imports: {
			type: [statementImportSchema],
			default: [],
		},
	},
	{ timestamps: true }
);

userSchema.index({ "imports.key": 1 }, { unique: true, sparse: true });

export const User = mongoose.model("User", userSchema);
export default User;
