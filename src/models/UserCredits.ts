import { Document, model, Model, models, Schema } from 'mongoose';

export interface IUserCredits extends Document {
  clerkUserId: string; // Clerk user ID
  credits: number; // Credit balance in dollars
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserCreditsSchema = new Schema<IUserCredits>({
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

export default (models.UserCredits as Model<IUserCredits>) || model<IUserCredits>('UserCredits', UserCreditsSchema);