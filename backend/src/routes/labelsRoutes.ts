import { Router } from "express";
import {
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
} from "../controllers/labelsController";

const router = Router();

router.get("/", getLabels);
router.post("/", createLabel);
router.put("/:id", updateLabel);
router.delete("/:id", deleteLabel);

export default router;