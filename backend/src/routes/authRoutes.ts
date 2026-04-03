import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema, registerSchema } from "../validators/authValidators";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(authController.register));
router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
