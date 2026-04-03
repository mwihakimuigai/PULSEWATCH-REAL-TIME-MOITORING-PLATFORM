import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController";
import { authenticate } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.get("/dashboard", asyncHandler(analyticsController.getDashboard));

export default router;
