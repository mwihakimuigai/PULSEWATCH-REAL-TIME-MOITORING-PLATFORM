import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { updateUserRoleSchema } from "../validators/userValidators";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/", asyncHandler(userController.list));
router.patch("/:id/role", validate(updateUserRoleSchema), asyncHandler(userController.updateRole));

export default router;
