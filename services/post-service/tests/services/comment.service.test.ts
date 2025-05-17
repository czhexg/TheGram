import { CommentService } from "@src/services/comment.service";
import { CommentRepository } from "@src/repositories/comment.repository";
import mongoose from "mongoose";
import { IComment } from "@src/models/comment.model";
import { Status } from "@src/models/constants";

jest.mock("@src/repositories/comment.repository");

describe("CommentService", () => {
    let commentService: CommentService;
    let commentRepository: jest.Mocked<CommentRepository>;

    // Mock data
    const mockComment = {
        _id: new mongoose.Types.ObjectId(),
        postId: new mongoose.Types.ObjectId(),
        authorId: "user123",
        text: "Test comment",
        status: Status.ACTIVE,
    } as Partial<IComment> as IComment;

    const mockReply = {
        _id: new mongoose.Types.ObjectId(),
        postId: mockComment.postId,
        parentCommentId: mockComment._id as mongoose.Types.ObjectId,
        authorId: "user456",
        text: "Test reply",
        status: Status.ACTIVE,
    } as Partial<IComment> as IComment;

    beforeEach(() => {
        jest.clearAllMocks();
        commentRepository =
            new CommentRepository() as jest.Mocked<CommentRepository>;
        commentService = new CommentService(commentRepository);
    });

    describe("createComment", () => {
        it("should create a new comment", async () => {
            commentRepository.create.mockResolvedValue(mockComment);

            const result = await commentService.createComment(mockComment);

            expect(commentRepository.create).toHaveBeenCalledWith(
                mockComment,
                undefined
            );
            expect(result).toEqual(mockComment);
        });
    });

    describe("getCommentById", () => {
        it("should return a comment by id", async () => {
            commentRepository.findById.mockResolvedValue(mockComment);

            const result = await commentService.getCommentById(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(commentRepository.findById).toHaveBeenCalledWith(
                mockComment._id,
                undefined
            );
            expect(result).toEqual(mockComment);
        });

        it("should return null if comment not found", async () => {
            commentRepository.findById.mockResolvedValue(null);

            const result = await commentService.getCommentById(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(result).toBeNull();
        });
    });

    describe("getCommentsByPost", () => {
        it("should return all comments for a post", async () => {
            const comments = [mockComment, mockReply];
            commentRepository.findByPost.mockResolvedValue(comments);

            const result = await commentService.getCommentsByPost(
                mockComment.postId!
            );

            expect(commentRepository.findByPost).toHaveBeenCalledWith(
                mockComment.postId,
                undefined
            );
            expect(result).toEqual(comments);
        });

        it("should return empty array if no comments found", async () => {
            commentRepository.findByPost.mockResolvedValue([]);

            const result = await commentService.getCommentsByPost(
                mockComment.postId!
            );

            expect(result).toEqual([]);
        });
    });

    describe("getCommentsByAuthor", () => {
        it("should return all comments by an author", async () => {
            const comments = [mockComment];
            commentRepository.findByAuthor.mockResolvedValue(comments);

            const result = await commentService.getCommentsByAuthor(
                mockComment.authorId!
            );

            expect(commentRepository.findByAuthor).toHaveBeenCalledWith(
                mockComment.authorId,
                undefined
            );
            expect(result).toEqual(comments);
        });

        it("should return empty array if no comments found", async () => {
            commentRepository.findByAuthor.mockResolvedValue([]);

            const result = await commentService.getCommentsByAuthor(
                mockComment.authorId!
            );

            expect(result).toEqual([]);
        });
    });

    describe("getCommentReplies", () => {
        it("should return all replies to a comment", async () => {
            const replies = [mockReply];
            commentRepository.findReplies.mockResolvedValue(replies);

            const result = await commentService.getCommentReplies(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(commentRepository.findReplies).toHaveBeenCalledWith(
                mockComment._id,
                undefined
            );
            expect(result).toEqual(replies);
        });

        it("should return empty array if no comments found", async () => {
            commentRepository.findReplies.mockResolvedValue([]);

            const result = await commentService.getCommentReplies(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(result).toEqual([]);
        });
    });

    describe("updateComment", () => {
        it("should update a comment text", async () => {
            const updateData = { text: "Updated text" };
            const updatedComment = {
                ...mockComment,
                ...updateData,
            } as IComment;
            commentRepository.update.mockResolvedValue(updatedComment);

            const result = await commentService.updateComment(
                mockComment._id! as mongoose.Types.ObjectId,
                updateData
            );

            expect(commentRepository.update).toHaveBeenCalledWith(
                mockComment._id,
                updateData,
                undefined
            );
            expect(result).toEqual(updatedComment);
        });

        it("should prevent updating protected fields", async () => {
            const updateData = {
                text: "Updated text",
                postId: new mongoose.Types.ObjectId(),
                authorId: "newAuthor",
                parentCommentId: new mongoose.Types.ObjectId(),
            };

            const expectedUpdate = { text: "Updated text" };
            const updatedComment = {
                ...mockComment,
                ...expectedUpdate,
            } as IComment;
            commentRepository.update.mockResolvedValue(updatedComment);

            const result = await commentService.updateComment(
                mockComment._id! as mongoose.Types.ObjectId,
                updateData
            );

            expect(commentRepository.update).toHaveBeenCalledWith(
                mockComment._id,
                expectedUpdate,
                undefined
            );
            expect(result).toEqual(updatedComment);
        });
    });

    describe("deleteComment", () => {
        it("should soft delete a comment", async () => {
            const deletedComment = {
                ...mockComment,
                status: Status.DELETED,
            } as IComment;
            commentRepository.delete.mockResolvedValue(deletedComment);

            const result = await commentService.deleteComment(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(commentRepository.delete).toHaveBeenCalledWith(
                mockComment._id,
                undefined
            );
            expect(result).toEqual(deletedComment);
            expect(result?.status).toBe(Status.DELETED);
        });
    });

    describe("hardDeleteComment", () => {
        it("should permanently delete a comment", async () => {
            commentRepository.hardDelete.mockResolvedValue(mockComment);

            const result = await commentService.hardDeleteComment(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(commentRepository.hardDelete).toHaveBeenCalledWith(
                mockComment._id,
                undefined
            );
            expect(result).toEqual(mockComment);
        });
    });

    describe("getRepliesRecursive", () => {
        it("should return empty array when no replies exist", async () => {
            commentRepository.findReplies.mockResolvedValue([]);

            const result = await commentService.getRepliesRecursive(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(result).toEqual([]);
        });

        it("should build nested reply structure", async () => {
            const reply1 = {
                ...mockReply,
                _id: new mongoose.Types.ObjectId(),
            } as IComment;
            const reply2 = {
                ...mockReply,
                _id: new mongoose.Types.ObjectId(),
            } as IComment;
            const nestedReply = {
                ...mockReply,
                _id: new mongoose.Types.ObjectId(),
                parentCommentId: reply1._id,
            } as IComment;

            // First level replies
            commentRepository.findReplies
                .mockResolvedValueOnce([reply1, reply2]) // For parent comment
                .mockResolvedValueOnce([nestedReply]) // For reply1
                .mockResolvedValueOnce([]) // For reply2
                .mockResolvedValueOnce([]); // For nestedReply

            const result = await commentService.getRepliesRecursive(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(result).toEqual([
                {
                    ...reply1,
                    replies: [{ ...nestedReply, replies: [] }],
                },
                { ...reply2, replies: [] },
            ]);
        });
    });

    describe("getNestedCommentsByPost", () => {
        it("should return nested comment structure for a post", async () => {
            const topLevelComment = {
                ...mockComment,
                parentCommentId: null,
            } as IComment;
            const reply = {
                ...mockReply,
                parentCommentId: topLevelComment._id,
            } as IComment;

            // Mock repository calls
            commentRepository.findByPost.mockResolvedValue([topLevelComment]);
            commentRepository.findReplies
                .mockResolvedValueOnce([reply]) // For topLevelComment
                .mockResolvedValueOnce([]); // For reply

            const result = await commentService.getNestedCommentsByPost(
                mockComment.postId!
            );

            expect(result).toEqual([
                {
                    ...topLevelComment,
                    replies: [{ ...reply, replies: [] }],
                },
            ]);
            expect(commentRepository.findByPost).toHaveBeenCalledWith(
                mockComment.postId,
                { parentCommentId: null }
            );
        });
    });
});
