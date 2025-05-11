import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/cofig.db.js";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;
const uri = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: uri,
    credentials: true, // Allow cookies
  })
);

app.use(express.json());

// Routes
import authRouter from "./routes/auth.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import userRouter from "./routes/user.routes.js";

app.get("/", (req, res) => {
  res.send("Welcome to the TrackCoder API");
});
app.get("/ping", (req, res) => {
  res.send("pong");
});
app.use("/api/auth", authRouter);
app.use("/api/friend", friendRoutes);
app.use("/api/user", userRouter);

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
