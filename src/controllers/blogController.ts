import { Request, Response } from "express";
import { Blog } from "../models/blogs.model.js";
import {
  deleteFromCloudinary,
  uploadSingleToCloudinary,
} from "../utils/cloudinary.js";

interface BlogParams {
  id: string; // for req.params.id
}

interface BlogRequestBody {
  title?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  category?: string;
  readTime?: string;
}

// Get all blogs
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get single blog
export const getBlogById = async (
  req: Request<BlogParams>,
  res: Response,
): Promise<any> => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Create blog
export const createBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log(req.file);
    const { title, excerpt, content, author, category, readTime } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    if (!title || !excerpt || !content || !author || !category || !readTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    //uploading photos to cloudinary
    const image = await uploadSingleToCloudinary(req.file);

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      author,
      category,
      readTime,
      image: image,
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: `${err}` });
  }
};

// Update blog
type BlogRequest = Request<BlogParams, any, BlogRequestBody>;
export const updateBlog = async (
  req: Request<{ id: string }, any, BlogRequestBody>,
  res: Response,
): Promise<any> => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    // Check if a new image file is uploaded
    if (req.file) {
      // Delete old images from Cloudinary
      const oldIds = blog.image.map((img) => img.public_id);
      if (oldIds.length > 0) await deleteFromCloudinary(oldIds);

      // Upload new image
      const uploaded = await uploadSingleToCloudinary(req.file);
      blog.image = [uploaded]; // replace with new image
    }

    // Update other fields
    blog.title = req.body.title ?? blog.title;
    blog.excerpt = req.body.excerpt ?? blog.excerpt;
    blog.content = req.body.content ?? blog.content;
    blog.author = req.body.author ?? blog.author;
    blog.category = req.body.category ?? blog.category;
    blog.readTime = req.body.readTime ?? blog.readTime;

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error("Update blog error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Delete blog
export const deleteBlog = async (
  req: Request<BlogParams>,
  res: Response,
): Promise<any> => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ error: "Blog not found" });

    const ids = deletedBlog.image.map((photo) => photo.public_id);
    await deleteFromCloudinary(ids);
    await deletedBlog.deleteOne();

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
