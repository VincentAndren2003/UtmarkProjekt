import { Schema, model, Types, InferSchemaType } from 'mongoose';

const profileSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
  },
  { timestamps: true }
);

export type ProfileDoc = InferSchemaType<typeof profileSchema>;
export const Profile = model('Profile', profileSchema);

