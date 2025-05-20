import { CommentController } from "@src/controllers/comment.controller";
import { CommentService } from "@src/services/comment.service";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { IComment } from "@src/models/comment.model";

// Mock the CommentService
jest.mock("@src/services/comment.service");

describe("CommentController", () => {
    let commentController: CommentController;
    let commentService: jest.Mocked<CommentService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    // Mock data
    const mockComment = {
        _id: new mongoose.Types.ObjectId(),
        postId: new mongoose.Types.ObjectId(),
        authorId: "user123",
        text: "Test comment",
    } as Partial<IComment> as IComment;

    const mockReply: Partial<IComment> = {
        ...mockComment,
        _id: new mongoose.Types.ObjectId(),
        parentCommentId: mockComment._id as mongoose.Types.ObjectId,
    };

    beforeAll(() => {
        // Initialize the mocked CommentService
        commentService = new CommentService(
            {} as any,
            {} as any
        ) as jest.Mocked<CommentService>;
        commentController = new CommentController(commentService);
    });

    beforeEach(() => {
        // Mock response object
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
                return this;
            }),
        };

        responseObject = {};
    });

    describe("createComment", () => {
        it("should create a new comment and return 201 status", async () => {
            mockRequest = {
                body: mockComment,
            };

            commentService.createComment.mockResolvedValue(
                mockComment as IComment
            );

            await commentController.createComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(commentService.createComment).toHaveBeenCalledWith(
                mockComment
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toEqual(mockComment);
        });

        it("should handle errors and return 500 status", async () => {
            mockRequest = {
                body: mockComment,
            };

            const errorMessage = "Database error";
            commentService.createComment.mockRejectedValue(
                new Error(errorMessage)
            );

            await commentController.createComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({
                message: "Failed to create comment",
                error: errorMessage,
            });
        });
    });

    describe("getCommentById", () => {
        it("should return a comment when found", async () => {
            mockRequest = {
                params: { id: mockComment._id!.toString() },
            };

            commentService.getCommentById.mockResolvedValue(
                mockComment as IComment
            );

            await commentController.getCommentById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(commentService.getCommentById).toHaveBeenCalledWith(
                mockComment._id
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(mockComment);
        });

        it("should return 404 when comment not found", async () => {
            mockRequest = {
                params: { id: new mongoose.Types.ObjectId().toString() },
            };

            commentService.getCommentById.mockResolvedValue(null);

            await commentController.getCommentById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({ message: "Comment not found" });
        });

        it("should handle invalid ObjectId format", async () => {
            mockRequest = {
                params: { id: "invalid-id" },
            };

            await commentController.getCommentById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.message).toBe("Failed to fetch comment");
        });
    });

    describe("getCommentsByPost", () => {
        it("should return comments for a post", async () => {
            const postId = mockComment.postId!;
            mockRequest = {
                params: { postId: postId.toString() },
            };

            const comments = [mockComment, mockReply] as IComment[];
            commentService.getCommentsByPost.mockResolvedValue(comments);

            await commentController.getCommentsByPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(commentService.getCommentsByPost).toHaveBeenCalledWith(
                postId
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(comments);
        });

        it("should handle errors", async () => {
            mockRequest = {
                params: { postId: mockComment.postId!.toString() },
            };

            const errorMessage = "Database error";
            commentService.getCommentsByPost.mockRejectedValue(
                new Error(errorMessage)
            );

            await commentController.getCommentsByPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({
                message: "Failed to fetch comments for post",
                error: errorMessage,
            });
        });
    });

    describe("getCommentsByAuthor", () => {
        it("should return comments by an author", async () => {
            const authorId = "user123";
            mockRequest = {
                params: { authorId },
            };

            const comments = [mockComment] as IComment[];
            commentService.getCommentsByAuthor.mockResolvedValue(comments);

            await commentController.getCommentsByAuthor(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(commentService.getCommentsByAuthor).toHaveBeenCalledWith(
                authorId
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(comments);
        });
    });

    describe("getCommentReplies", () => {
        it("should return replies to a comment", async () => {
            const parentCommentId = mockComment._id!;
            mockRequest = {
                params: { commentId: parentCommentId.toString() },
            };

            const replies = [mockReply] as IComment[];
            commentService.getCommentReplies.mockResolvedValue(replies);

            await commentController.getCommentReplies(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(commentService.getCommentReplies).toHaveBeenCalledWith(
                parentCommentId
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(replies);
        });
    });

    describe("updateComment", () => {
        it("should update a comment and return the updated comment", async () => {
            const updateData = { text: "Updated comment" };
            mockRequest = {
                params: { id: mockComment._id!.toString() },
                body: updateData,
            };

            const updatedComment = { ...mockComment, ...updateData };
            commentService.updateComment.mockResolvedValue(
                updatedComment as IComment
            );

            await commentController.updateComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(commentService.updateComment).toHaveBeenCalledWith(
                mockComment._id,
                expect.objectContaining(updateData)
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(updatedComment);
        });

        it("should prevent updating protected fields", async () => {
            const updateData = {
                text: "Updated comment",
                postId: new mongoose.Types.ObjectId(),
                authorId: "newAuthor",
                parentCommentId: new mongoose.Types.ObjectId(),
            };

            const expectedUpdate = { text: "Updated comment" };
            const updatedComment = { ...mockComment, ...expectedUpdate };
            commentService.updateComment.mockResolvedValue(
                updatedComment as IComment
            );

            await commentController.updateComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(commentService.updateComment).toHaveBeenCalledWith(
                mockComment._id,
                expectedUpdate
            );
        });
    });

    describe("deleteComment", () => {
        it("should delete a comment and return success message", async () => {
            mockRequest = {
                params: { id: mockComment._id!.toString() },
            };

            commentService.deleteComment.mockResolvedValue(
                mockComment as IComment
            );

            await commentController.deleteComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(commentService.deleteComment).toHaveBeenCalledWith(
                mockComment._id
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                message: "Comment deleted successfully",
            });
        });

        it("should return 404 when comment to delete not found", async () => {
            mockRequest = {
                params: { id: new mongoose.Types.ObjectId().toString() },
            };

            commentService.deleteComment.mockResolvedValue(null);

            await commentController.deleteComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({ message: "Comment not found" });
        });
    });

    describe("getNestedCommentsByPost", () => {
        it("should return nested comments for a post", async () => {
            const postId = mockComment.postId!;
            mockRequest = {
                params: { postId: postId.toString() },
            };

            const nestedComments = [
                {
                    ...mockComment,
                    replies: [mockReply],
                },
            ];

            commentService.getNestedCommentsByPost.mockResolvedValue(
                nestedComments as any
            );

            await commentController.getNestedCommentsByPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(commentService.getNestedCommentsByPost).toHaveBeenCalledWith(
                postId
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(nestedComments);
        });

        it("should handle errors", async () => {
            mockRequest = {
                params: { postId: mockComment.postId!.toString() },
            };

            const errorMessage = "Database error";
            commentService.getNestedCommentsByPost.mockRejectedValue(
                new Error(errorMessage)
            );

            await commentController.getNestedCommentsByPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({
                message: "Failed to fetch nested comments",
                error: errorMessage,
            });
        });
    });
});
