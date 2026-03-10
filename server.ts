import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { parseEmailForLeave } from "./backend/services/geminiService.ts";

// Import Routes
import authRoutes from "./backend/routes/authRoutes.ts";
import attendanceRoutes from "./backend/routes/attendanceRoutes.ts";
import taskRoutes from "./backend/routes/taskRoutes.ts";
import leaveRoutes from "./backend/routes/leaveRoutes.ts";
import performanceRoutes from "./backend/routes/performanceRoutes.ts";
import notificationRoutes from "./backend/routes/notificationRoutes.ts";
import activityRoutes from "./backend/routes/activityRoutes.ts";
import { authenticate } from "./backend/middleware/auth.ts";
import { connectDB } from "./backend/config/db.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  app.use(express.json());

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/tasks", taskRoutes(io));
  app.use("/api/leaves", leaveRoutes);
  app.use("/api/performance", performanceRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/activity", activityRoutes);
  
  // Backward compatibility for the frontend calls that use /api/users directly
  app.use("/api", authRoutes); 

  // AI & Email Integration
  app.post("/api/ai/parse-email", authenticate, async (req: any, res) => {
    const { emailContent } = req.body;
    try {
      const result = await parseEmailForLeave(emailContent);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Socket setup
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
