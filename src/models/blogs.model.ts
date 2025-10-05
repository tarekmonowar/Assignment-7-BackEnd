import { Document, model, Schema } from "mongoose";

export interface IImage {
  public_id: string;
  url: string;
}
export interface IBlog extends Document {
  title: string;
  excerpt: string;
  content: string;
  image: IImage[];
  date: Date;
  author: string;
  category: string;
  readTime: string;
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image: [
    {
      public_id: {
        type: String,
        required: [true, "Please enter product image public_id"],
      },
      url: {
        type: String,
        required: [true, "Please enter product image URL"],
      },
    },
  ],
  date: { type: Date, default: Date.now },
  author: { type: String, required: true },
  category: { type: String, required: true },
  readTime: { type: String, required: true },
});

// Avoid recompiling model on hot reload
export const Blog = model<IBlog>("Blog", BlogSchema);
