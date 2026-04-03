import { Router } from "express";
import alertRoutes from "./alertRoutes";
import analyticsRoutes from "./analyticsRoutes";
import authRoutes from "./authRoutes";
import eventRoutes from "./eventRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/alerts", alertRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/users", userRoutes);

export default router;
