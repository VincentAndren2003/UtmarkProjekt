import { Schema, model, Types, InferSchemaType } from 'mongoose';

const userStatsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    routesGeneratedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    routesSharedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    routesRecievedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedRunsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxRunDistanceCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDistanceMeters: {
      type: Number,
      default: 0,
      min: 0,
    },
    dayStreakOfCompletedRuns: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRunCompletedAt: {
      type: Date,
      default: null,
    },
    totalCheckpointsTaken: {
      type: Number,
      default: 0,
      min: 0,
    }    
  },
  { timestamps: true }
);

export type UserStatsDoc = InferSchemaType<typeof userStatsSchema>;
export const UserStats = model('UserStats', userStatsSchema);