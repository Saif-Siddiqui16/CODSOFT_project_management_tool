import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./src/routes/auth-route.js";
import workspaceRoutes from "./src/routes/workspace-route.js";
import projectRoutes from "./src/routes/project-route.js";
import taskRoutes from "./src/routes/task-route.js";
import errorHandler from "./src/middleware/errorHandler.js";
import dotenv from "dotenv";
import { connectDb } from "./src/config/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS - adjust origin to your frontend in production
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// basic rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
});
app.use(limiter);

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspace", workspaceRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

app.listen(PORT, async () => {
  await connectDb();
  console.log("server is running");
});
