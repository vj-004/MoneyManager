import mongoose from "mongoose"


export const connectDB = async () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("DB is connected");
    })
    .catch((error) => {
        console.log('Error in connecting DB');
        console.log(error);
        process.exit(1);
    })
}