import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoute from "./routes/chat.js"
import authRoute from "./routes/auth.js"


const app = express();
const PORT = process.env.PORT || 8080;

const connectDB = async () => {
    const candidates = [];
    if (process.env.MONGODB_URI) candidates.push(process.env.MONGODB_URI);
    // local fallback
    candidates.push("mongodb://127.0.0.1:27017/Metamind");

    for (const uri of candidates) {
        try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
            console.log("connected with DB:", uri);
            return;
        } catch (e) {
            console.log(`connection failed for ${uri}:`, e.message || e);
        }
    }

    console.log("Could not connect to any MongoDB instance. Routes that require DB will return 503.");
}

app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use("/api/auth", authRoute);
app.use("/api", chatRoute);

app.get('/health', (req, res) => {
    res.json({ dbState: mongoose.connection.readyState });
});

connectDB();

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});
