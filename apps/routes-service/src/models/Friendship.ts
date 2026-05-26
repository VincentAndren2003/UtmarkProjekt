import mongoose, { Schema } from 'mongoose';

const friendshipSchema = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Friendship = mongoose.model('Friendship', friendshipSchema);
