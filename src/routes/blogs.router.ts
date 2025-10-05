import { Router } from "express";
import multer from "multer";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = Router();
const upload = multer();

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", upload.single("image"), createBlog);
router.put("/:id", upload.single("image"), updateBlog);
router.delete("/:id", deleteBlog);

export default router;
