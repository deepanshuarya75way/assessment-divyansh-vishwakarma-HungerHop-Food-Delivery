import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (error) {
  console.warn('Failed to set custom DNS servers, using system default:', error.message);
}

import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { connectdb } from './config/db.js';
import { authRouter } from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { shopRouter } from './routes/shop.route.js';
import { itemRouter } from './routes/item.route.js';
import { orderRouter } from './routes/order.route.js';
import http from 'http';
import { Server } from 'socket.io';
import { socketHandler } from './socket.js';

const app = express();
app.set("trust proxy",1);
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://southwest-phys-camcorder-appropriate.trycloudflare.com"
];

// Helper function for safe origin validation
const checkOrigin = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl, Postman)
  if (!origin) return callback(null, true);
  
  if (allowedOrigins.includes(origin) || (typeof origin === 'string' && origin.endsWith('.trycloudflare.com'))) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    credentials: true,
    methods: ['POST', 'GET', 'PUT']
  }
});
app.set("io", io);

const port = process.env.PORT || 5000;

app.use(cors({
  origin: checkOrigin,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/shop", shopRouter);
app.use("/api/v1/item", itemRouter);
app.use("/api/v1/order", orderRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

socketHandler(io);

// Start server after connecting to database (Best Practice)
const startServer = async () => {
  try {
    await connectdb();
    server.listen(port, () => {
      console.log(`Server started at port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();