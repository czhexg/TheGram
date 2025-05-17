import mongoose, { Date, ObjectId } from "mongoose";
import { Status } from "./constants";

interface IComment extends mongoose.Document {
    postId: mongoose.Types.ObjectId;
    parentCommentId?: mongoose.Types.ObjectId | null;
    authorId: string;
    text: string;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new mongoose.Schema<IComment>(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        parentCommentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment", // Self-reference to allow nesting
            default: null, // Explicitly set to null if not a reply
        },
        authorId: { type: String, required: true },
        text: { type: String, required: true },
        status: { type: String, default: Status.ACTIVE },
    },
    { timestamps: true }
);

const Comment = mongoose.model<IComment>("Comment", CommentSchema);

export { Comment, IComment };
