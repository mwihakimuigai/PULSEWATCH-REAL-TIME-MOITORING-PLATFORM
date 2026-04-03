import { Router } from "express";
import { alertController } from "../controllers/alertController";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(alertController.list));
router.patch("/:id/resolve", authorize("admin"), asyncHandler(alertController.resolve));

export default router;
