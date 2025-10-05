import { Router } from "express";
import multer from "multer";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = Router();
const upload = multer();

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", upload.single("cover"), createProject);
router.put("/:id", upload.single("cover"), updateProject);
router.delete("/:id", deleteProject);

export default router;
