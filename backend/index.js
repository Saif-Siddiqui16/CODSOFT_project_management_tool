import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth-route.js";
import workspaceRoutes from "./src/routes/workspace-route.js";
import projectRoutes from "./src/routes/project-route.js";
import taskRoutes from "./src/routes/task-route.js";
import errorHandler from "./src/middleware/errorHandler.js";
import { connectDb } from "./src/config/db.js";
import path from "path";

dotenv.config();
const app = express();

const _dirname = path.resolve();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});
app.use(limiter);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspace", workspaceRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.use((_, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

app.listen(process.env.PORT, async () => {
  await connectDb();
  console.log(`✅ Server running on Render`);
});
