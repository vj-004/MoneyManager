import express from "express";
import { uploadStatement } from "../controllers/account.controller.js";

const router = express.Router();

router.post("/upload-statement", uploadStatement);

export default router;