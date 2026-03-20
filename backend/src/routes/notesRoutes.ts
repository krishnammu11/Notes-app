import { Router } from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  addLabel,
  removeLabel,
} from "../controllers/notesController";

const router = Router();

router.get("/", getNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.patch("/:id/labels/:labelId", addLabel);
router.delete("/:id/labels/:labelId", removeLabel);

export default router;