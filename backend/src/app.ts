import cors from "cors";
import express from "express";
import helmet from "helmet";
import routes from "./routes";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

export const app = express();

const allowedOrigins = new Set([env.CLIENT_URL, "http://127.0.0.1:5173", "http://localhost:5173"]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "PulseWatch API" });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);
