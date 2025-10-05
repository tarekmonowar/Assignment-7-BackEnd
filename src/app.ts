import express from "express";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import contact from "./routes/contactForm.route.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import blogRoutes from "./routes/blogs.router.js";
import projectRoutes from "./routes/project.router.js";
import authRoutes from "./routes/auth.route.js";

import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
connectDB();

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
app.use("/api/blog", blogRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/auth", authRoutes);
app.use("/contact", contact);

// Home
app.get("/", (req, res) => {
  res.send("I am getting data from home");
});

// 404
app.use((req, res) => {
  res.status(400).send("Bad Request tarek");
});

export default app;
