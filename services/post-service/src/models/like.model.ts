import mongoose, { Date } from "mongoose";

interface ILike extends mongoose.Document {
    postId: mongoose.Types.ObjectId;
    userId: string;
    createdAt: Date;
}

const LikeSchema = new mongoose.Schema<ILike>(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        userId: { type: String, required: true },
    },
    { timestamps: true }
);

// Prevent duplicate likes
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

const Like = mongoose.model<ILike>("Like", LikeSchema);

export { Like, ILike };
