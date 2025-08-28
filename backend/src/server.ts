import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import commentRoutes from "./routes/comment.js";
import marketRoutes from "./routes/market.js";
import betRoutes from "./routes/bets.js";
// import walletRoutes from "./routes/wallet.js";
import paymentRoutes from "./routes/payment.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import { setIoInstance } from "./controllers/comment.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setIoInstance(io);
const __dirname = path.resolve();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    // origin: process.env.FRONTEND_URL || "https://bet-tiktok.vercel.app",
    origin: [
      
      "https://gregarious-travesseiro-9cc07c.netlify.app"

    ],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("combined"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
});
app.use(limiter);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/reset-page/:token", (req, res) => {
  const { token } = req.params;
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const templatePath = path.join(__dirname, "views", "reset-page.html");

  fs.readFile(templatePath, "utf8", (err, html) => {
    if (err) {
      return res.status(500).send("Error loading the reset page");
    }

    const renderedHtml = html.replace(/{{RESET_LINK}}/g, resetLink);
    res.send(renderedHtml);
  });
});

app.get("/", (req, res) => {
  res.send("Hello, Betting App!");
});

app.set("trust proxy", 1);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin/markets", marketRoutes);
app.use("/api/admin/bets", betRoutes);
// app.use("/api/wallet", walletRoutes);
app.use("/api/payments", paymentRoutes);


app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: err.message });
  }
);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
