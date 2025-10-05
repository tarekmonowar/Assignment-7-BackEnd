import { Document, model, Schema } from "mongoose";

export interface IImage {
  public_id: string;
  url: string;
}

export interface IProject extends Document {
  slug: string;
  title: string;
  summary: string;
  cover: IImage[]; // changed to array of images
  tags: string[];
  githubLink: string;
  liveLink: string;
}

const ProjectSchema = new Schema<IProject>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  cover: [
    {
      public_id: {
        type: String,
        required: [true, "Please provide project image public_id"],
      },
      url: {
        type: String,
        required: [true, "Please provide project image URL"],
      },
    },
  ],
  tags: [{ type: String, required: true }],
  githubLink: { type: String, required: true },
  liveLink: { type: String, required: true },
});

// Avoid recompiling model on hot reload
export const Project = model<IProject>("Project", ProjectSchema);
