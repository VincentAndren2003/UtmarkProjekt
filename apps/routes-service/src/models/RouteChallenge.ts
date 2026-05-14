import mongoose, { Schema, InferSchemaType } from 'mongoose';

const routeChallengeSchema = new Schema(
  {
    route: {
      type: Schema.Types.ObjectId,
      ref: 'RouteRecord',
      required: true,
      index: true,
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sourceRun: {
      type: Schema.Types.ObjectId,
      ref: 'Run',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

routeChallengeSchema.index({ fromUserId: 1, status: 1, createdAt: -1 });
routeChallengeSchema.index({ toUserId: 1, status: 1, createdAt: -1 });

export type RouteChallengeDoc = InferSchemaType<typeof routeChallengeSchema>;
export const RouteChallenge = mongoose.model(
  'RouteChallenge',
  routeChallengeSchema
);