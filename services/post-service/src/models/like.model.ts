import mongoose, { Date, ObjectId } from "mongoose";

interface ILike extends mongoose.Document {
    postId: ObjectId;
    userId: string;
    createdAt: Date;
}

const LikeSchema = new mongoose.Schema<ILike>(
    {
        postId: { type: mongoose.Types.ObjectId, ref: "Post", required: true },
        userId: { type: String, required: true },
    },
    { timestamps: true }
);

// Prevent duplicate likes
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = mongoose.model<ILike>("Like", LikeSchema);
