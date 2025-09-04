import mongoose from 'mongoose';

export interface IUsageSession extends mongoose.Document {
  clerkUserId: string;
  sessionType: 'roleplay'; // Can add more types later
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  creditsUsed: number; // Amount deducted (0.15 per minute)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UsageSessionSchema = new mongoose.Schema<IUsageSession>({
  clerkUserId: {
    type: String,
    required: true,
  },
  sessionType: {
    type: String,
    required: true,
    default: 'roleplay',
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: Date,
  durationMinutes: {
    type: Number,
    default: 0,
  },
  creditsUsed: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.UsageSession || mongoose.model<IUsageSession>('UsageSession', UsageSessionSchema);