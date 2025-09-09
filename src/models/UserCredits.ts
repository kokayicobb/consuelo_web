import mongoose, { Model } from 'mongoose';

export interface IUserCredits extends mongoose.Document {
  clerkUserId: string; // Clerk user ID
  credits: number; // Credit balance in dollars
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserCreditsSchema = new mongoose.Schema<IUserCredits>({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
  },
  credits: {
    type: Number,
    default: 0,
  },
  stripeCustomerId: String,
}, {
  timestamps: true,
});

export default (mongoose.models.UserCredits as Model<IUserCredits>) || mongoose.model<IUserCredits>('UserCredits', UserCreditsSchema);