import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import activityRoutes from "./routes/activity";
import balanceRoutes from "./routes/balance";
import userRoutes from "./routes/users";
import holdingsRoutes from "./routes/holdings";
import connectDatabase from "./config/database";
import ErrorHandler from "./utils/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/activity", activityRoutes);
app.use("/balance", balanceRoutes);
app.use("/user", userRoutes);
app.use("/api/holdings", holdingsRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Start server
app.use((error: ErrorHandler, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(error.statusCode ?? 500).json({
    success: false,
    message: error.statusCode ? error.message : "Internal server error",
  });
});

connectDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});
