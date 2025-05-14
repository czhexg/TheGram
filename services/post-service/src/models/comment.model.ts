import mongoose, { Date, ObjectId } from "mongoose";
import { Status } from "./constants";

interface IComment extends mongoose.Document {
    postId: ObjectId;
    parentCommentId?: ObjectId | null;
    authorId: string;
    text: string;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new mongoose.Schema<IComment>(
    {
        postId: { type: mongoose.Types.ObjectId, ref: "Post", required: true },
        parentCommentId: {
            type: mongoose.Types.ObjectId,
            ref: "Comment", // Self-reference to allow nesting
            default: null, // Explicitly set to null if not a reply
        },
        authorId: { type: String, required: true },
        text: { type: String, required: true },
        status: Status.ACTIVE,
    },
    { timestamps: true }
);

const Comment = mongoose.model<IComment>("Comment", CommentSchema);

export { Comment, IComment };
