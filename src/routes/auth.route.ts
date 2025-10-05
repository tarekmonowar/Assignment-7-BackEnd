import { Router } from "express";
import { loginUser } from "../controllers/AuthController.js";

const router = Router();

router.post("/login", loginUser);

export default router;
