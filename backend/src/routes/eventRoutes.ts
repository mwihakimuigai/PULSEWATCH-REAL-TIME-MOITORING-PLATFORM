import { Router } from "express";
import { eventController } from "../controllers/eventController";
import { authenticate } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { createEventSchema } from "../validators/eventValidators";
import { simulateEventsSchema } from "../validators/simulationValidators";

const router = Router();

router.use(authenticate);
router.post("/", validate(createEventSchema), asyncHandler(eventController.create));
router.post("/simulate", validate(simulateEventsSchema), asyncHandler(eventController.simulate));
router.get("/", asyncHandler(eventController.list));
router.get("/export/csv", asyncHandler(eventController.exportCsv));
router.get("/:id", asyncHandler(eventController.getById));

export default router;
