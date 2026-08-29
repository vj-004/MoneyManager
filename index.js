import express from "express";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import cors from 'cors';
import { returnResponse } from "./utils/specialUtils.js";
import fileUpload from "express-fileupload";
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";


dotenv.config();
const PORT = process.env.PORT || 4000;

connectDB();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp'
}));
app.use("/api/account", accountRoutes);
app.use("/api/transaction", transactionRoutes);

app.get('/', (req,res) => {
    return returnResponse(res,200,true,"Your server is up and running...");
});

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});

