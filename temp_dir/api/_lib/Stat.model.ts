import mongoose from 'mongoose';

export interface IStat extends mongoose.Document {
  name: string;
  views: number;
  downloads: number;
}

const StatSchema = new mongoose.Schema<IStat>({
  name: { type: String, required: true, unique: true, default: 'global' },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
});

export default mongoose.models.Stat || mongoose.model<IStat>('Stat', StatSchema);
