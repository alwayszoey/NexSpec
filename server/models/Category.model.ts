import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    categoryId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "https://img1.pic.in.th/images/2000x600_20260602154514.png" },
    isPopular: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
