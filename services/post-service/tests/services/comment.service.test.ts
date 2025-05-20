import { CommentService } from "@src/services/comment.service";
import { CommentRepository } from "@src/repositories/comment.repository";
import mongoose from "mongoose";
import { IComment } from "@src/models/comment.model";
import { Status } from "@src/models/constants";
import { PostRepository } from "@src/repositories/post.repository";
import { IPost } from "@src/models/post.model";

jest.mock("@src/repositories/comment.repository");
jest.mock("@src/repositories/post.repository");

describe("CommentService", () => {
    let commentService: CommentService;
    let commentRepository: jest.Mocked<CommentRepository>;
    let postRepository: jest.Mocked<PostRepository>;

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

    const mockPost = {
        _id: mockComment.postId,
        title: "Test Post",
        content: "Test Content",
        authorId: "user123",
        likeCount: 0,
        commentCount: 1,
        status: Status.ACTIVE,
    } as Partial<IPost> as IPost;

    const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
        withTransaction: jest.fn(),
    } as unknown as mongoose.ClientSession;

    beforeEach(() => {
        jest.clearAllMocks();
        commentRepository =
            new CommentRepository() as jest.Mocked<CommentRepository>;
        postRepository = new PostRepository() as jest.Mocked<PostRepository>;
        commentService = new CommentService(commentRepository, postRepository);

        jest.spyOn(mongoose, "startSession").mockImplementation(() =>
            Promise.resolve(mockSession)
        );
    });

    describe("createComment", () => {
        it("should create a new comment and increment post comment count", async () => {
            commentRepository.create.mockResolvedValue(mockComment);
            postRepository.incrementCounter.mockResolvedValue(mockPost);

            const result = await commentService.createComment(mockComment);

            expect(result).toEqual(mockComment);
            expect(commentRepository.create).toHaveBeenCalledWith(
                mockComment,
                expect.objectContaining({ session: expect.anything() })
            );
            expect(postRepository.incrementCounter).toHaveBeenCalledWith(
                mockComment.postId,
                "commentCount",
                expect.objectContaining({ session: expect.anything() })
            );

            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).not.toHaveBeenCalled();
        });

        it("should abort transaction if like creation fails", async () => {
            commentRepository.create.mockRejectedValue(new Error("DB error"));

            await expect(
                commentService.createComment(mockComment)
            ).rejects.toThrow("DB error");

            // Verify transaction flow
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.commitTransaction).not.toHaveBeenCalled();
        });
    });

    describe("getCommentById", () => {
        it("should return a comment by id", async () => {
            commentRepository.findById.mockResolvedValue(mockComment);

            const result = await commentService.getCommentById(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(commentRepository.findById).toHaveBeenCalledWith(
                mockComment._id
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
                mockComment.postId
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
                mockComment.authorId
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
                mockComment._id
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
                updateData
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
                expectedUpdate
            );
            expect(result).toEqual(updatedComment);
        });
    });

    describe("deleteComment", () => {
        it("should soft delete a comment and decrement post comment count", async () => {
            const deletedComment = {
                ...mockComment,
                status: Status.DELETED,
            } as IComment;
            commentRepository.delete.mockResolvedValue(deletedComment);
            commentRepository.findById.mockResolvedValue(mockComment);
            postRepository.decrementCounter.mockResolvedValue({
                ...mockPost,
                commentCount: 0,
            } as IPost);

            const result = await commentService.deleteComment(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(result).toEqual(deletedComment);
            expect(commentRepository.delete).toHaveBeenCalledWith(
                mockComment._id,
                expect.objectContaining({ session: expect.anything() })
            );
            expect(postRepository.decrementCounter).toHaveBeenCalledWith(
                mockComment.postId,
                "commentCount",
                expect.objectContaining({ session: expect.anything() })
            );
            expect(result?.status).toBe(Status.DELETED);

            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).not.toHaveBeenCalled();
        });
    });

    describe("hardDeleteComment", () => {
        it("should permanently delete a comment", async () => {
            commentRepository.hardDelete.mockResolvedValue(mockComment);
            commentRepository.findById.mockResolvedValue(mockComment);
            postRepository.decrementCounter.mockResolvedValue({
                ...mockPost,
                commentCount: 0,
            } as IPost);

            const result = await commentService.hardDeleteComment(
                mockComment._id! as mongoose.Types.ObjectId
            );

            expect(result).toEqual(mockComment);
            expect(commentRepository.hardDelete).toHaveBeenCalledWith(
                mockComment._id,
                expect.objectContaining({ session: expect.anything() })
            );
            expect(postRepository.decrementCounter).toHaveBeenCalledWith(
                mockComment.postId,
                "commentCount",
                expect.objectContaining({ session: expect.anything() })
            );

            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).not.toHaveBeenCalled();
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
