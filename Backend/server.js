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
            console.log(`[DB] Attempting to connect to: ${uri.substring(0, 50)}...`);
            await mongoose.connect(uri, { 
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                retryWrites: true,
                w: 'majority'
            });
            console.log("[DB] ✓ Connected successfully!");
            return;
        } catch (e) {
            console.error(`[DB] ✗ Connection failed for ${uri.substring(0, 50)}:`, e.message);
        }
    }

    console.error("[DB] ✗ Could not connect to any MongoDB instance. Routes that require DB will return 503.");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

console.log('CORS Allowed Origins:', allowedOrigins);

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});

app.use("/api/auth", authRoute);
app.use("/api", chatRoute);

app.get('/health', (req, res) => {
    res.json({ 
        dbState: mongoose.connection.readyState,
        dbStatus: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
        allowedOrigins: allowedOrigins
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Error]', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

connectDB();

app.listen(PORT, () => {
    console.log(`server running on PORT ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
