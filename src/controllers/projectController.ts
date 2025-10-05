import { Request, Response } from "express";
import { Project } from "../models/project.model.js";
import {
  deleteFromCloudinary,
  uploadSingleToCloudinary,
} from "../utils/cloudinary.js";

interface ProjectParams {
  id: string;
}

interface ProjectRequestBody {
  slug?: string;
  title?: string;
  summary?: string;
  githubLink?: string;
  liveLink?: string;
  tags?: string[];
}

// Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ _id: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get project by ID
export const getProjectById = async (
  req: Request<ProjectParams>,
  res: Response,
): Promise<any> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Create project
export const createProject = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    console.log(req.body);
    const { slug, title, summary, githubLink, liveLink, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Cover image is required" });
    }

    if (!slug || !title || !summary || !githubLink || !liveLink || !tags) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Upload image to Cloudinary
    const image = await uploadSingleToCloudinary(req.file);

    const project = await Project.create({
      slug,
      title,
      summary,
      githubLink,
      liveLink,
      tags: Array.isArray(tags) ? tags : JSON.parse(tags),
      cover: [image],
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: `${err}` });
  }
};

// Update project
export const updateProject = async (
  req: Request<{ id: string }, any, ProjectRequestBody>,
  res: Response,
): Promise<any> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // If new image is uploaded
    if (req.file) {
      const oldIds = project.cover.map((img) => img.public_id);
      if (oldIds.length > 0) await deleteFromCloudinary(oldIds);

      const uploaded = await uploadSingleToCloudinary(req.file);
      project.cover = [uploaded]; // replace with new cover image
    }

    // Update fields
    project.slug = req.body.slug ?? project.slug;
    project.title = req.body.title ?? project.title;
    project.summary = req.body.summary ?? project.summary;
    project.githubLink = req.body.githubLink ?? project.githubLink;
    project.liveLink = req.body.liveLink ?? project.liveLink;
    project.tags = (req.body.tags as string[]) ?? project.tags;

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Delete project
export const deleteProject = async (
  req: Request<ProjectParams>,
  res: Response,
): Promise<any> => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject)
      return res.status(404).json({ error: "Project not found" });

    const ids = deletedProject.cover.map((photo) => photo.public_id);
    await deleteFromCloudinary(ids);
    await deletedProject.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
