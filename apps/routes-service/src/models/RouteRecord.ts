import mongoose, { Schema, InferSchemaType } from 'mongoose';

const checkpointSchema = new Schema(
  {
    id: { type: String, required: true },
    coordinate: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    radius: { type: Number, default: 20 },
  },
  { _id: false }
);

const routeRecordSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    start: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    distance: { type: Number, required: true },
    checkpoints: { type: [checkpointSchema], required: true },
    filters: { type: [String], default: [] },
  },
  { timestamps: true }
);

routeRecordSchema.index({ createdBy: 1, createdAt: -1 });

export type RouteRecordDoc = InferSchemaType<typeof routeRecordSchema>;
export const RouteRecord = mongoose.model('RouteRecord', routeRecordSchema);