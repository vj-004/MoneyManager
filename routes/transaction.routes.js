import express from "express";
import {
	getAllTransactions,
	getTransactionById,
	updateTransaction,
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/", getAllTransactions);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);

export default router;
