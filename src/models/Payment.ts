import { Document, model, Model, models, Schema } from 'mongoose';

export interface IPayment extends Document {
  clerkUserId: string;
  stripePaymentIntentId: string;
  stripeCustomerId: string;
  amount: number; // Credit amount in dollars
  serviceFee: number; // Service fee in dollars
  totalAmount: number; // Total amount in dollars
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  creditsAdded: boolean; // Whether credits were actually added to user account
  metadata?: {
    description?: string;
    minutes?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  clerkUserId: {
    type: String,
    required: true,
    index: true,
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  serviceFee: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled'],
    default: 'pending',
    required: true,
  },
  creditsAdded: {
    type: Boolean,
    default: false,
  },
  metadata: {
    description: String,
    minutes: Number,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
PaymentSchema.index({ clerkUserId: 1, status: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1, status: 1 });

export default (models.Payment as Model<IPayment>) || model<IPayment>('Payment', PaymentSchema);