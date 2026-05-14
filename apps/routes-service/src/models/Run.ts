import mongoose, { Schema, InferSchemaType } from 'mongoose';

const runSchema = new Schema(
  {
    route: {
      type: Schema.Types.ObjectId,
      ref: 'RouteRecord',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    startedAt: { type: Date, default: () => new Date() },
    finishedAt: { type: Date },
    durationSeconds: { type: Number },
    checkpointsCompleted: { type: Number },
    distanceMeters: { type: Number },
  },
  { timestamps: true }
);

runSchema.index({ userId: 1, createdAt: -1 });

export type RunDoc = InferSchemaType<typeof runSchema>;
export const Run = mongoose.model('Run', runSchema);