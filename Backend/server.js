import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoute from "./routes/chat.js"
import authRoute from "./routes/auth.js"


const app = express();
const PORT = 8080;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected with DB")
    } catch (e) {
        console.log("connection failed with DB", e);
    }
}

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoute);
app.use("/api", chatRoute);

connectDB();

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});
