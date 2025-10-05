import express from "express";

const router = express.Router();
import { postContact } from "../controllers/contactForm.controller.js";

router.post("/", postContact);

router.get("/", (req, res) => {
  res.send("I am getting data from contact form route");
});

export default router;
