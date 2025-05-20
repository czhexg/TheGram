import { LikeController } from "@src/controllers/like.controller";
import { LikeService } from "@src/services/like.service";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { ILike } from "@src/models/like.model";

// Mock the LikeService
jest.mock("@src/services/like.service");

describe("LikeController", () => {
    let likeController: LikeController;
    let likeService: jest.Mocked<LikeService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    // Mock data
    const mockLike = {
        _id: new mongoose.Types.ObjectId(),
        postId: new mongoose.Types.ObjectId(),
        userId: "user123",
    } as Partial<ILike> as ILike;

    beforeEach(() => {
        // Initialize the mocked LikeService
        likeService = new LikeService(
            {} as any,
            {} as any
        ) as jest.Mocked<LikeService>;
        likeController = new LikeController(likeService);

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

    describe("createLike", () => {
        it("should create a new like and return 201 status", async () => {
            mockRequest = {
                body: mockLike,
            };

            likeService.createLike.mockResolvedValue(mockLike as ILike);

            await likeController.createLike(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(likeService.createLike).toHaveBeenCalledWith(mockLike);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toEqual(mockLike);
        });

        it("should handle errors and return 500 status", async () => {
            mockRequest = {
                body: mockLike,
            };

            const errorMessage = "Database error";
            likeService.createLike.mockRejectedValue(new Error(errorMessage));

            await likeController.createLike(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({
                message: "Failed to create like",
                error: errorMessage,
            });
        });
    });

    describe("getLikeById", () => {
        it("should return a like when found", async () => {
            mockRequest = {
                params: { id: mockLike._id!.toString() },
            };

            likeService.getLikeById.mockResolvedValue(mockLike as ILike);

            await likeController.getLikeById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(likeService.getLikeById).toHaveBeenCalledWith(mockLike._id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(mockLike);
        });

        it("should return 404 when like not found", async () => {
            mockRequest = {
                params: { id: new mongoose.Types.ObjectId().toString() },
            };

            likeService.getLikeById.mockResolvedValue(null);

            await likeController.getLikeById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({ message: "Like not found" });
        });

        it("should handle invalid ObjectId format", async () => {
            mockRequest = {
                params: { id: "invalid-id" },
            };

            await likeController.getLikeById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.message).toBe("Failed to fetch like");
        });
    });

    describe("getLikesByPost", () => {
        it("should return likes for a post", async () => {
            const postId = mockLike.postId!;
            mockRequest = {
                params: { postId: postId.toString() },
            };

            const likes = [mockLike, mockLike] as ILike[];
            likeService.getLikesByPost.mockResolvedValue(likes);

            await likeController.getLikesByPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(likeService.getLikesByPost).toHaveBeenCalledWith(postId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(likes);
        });

        it("should handle errors", async () => {
            mockRequest = {
                params: { postId: mockLike.postId!.toString() },
            };

            const errorMessage = "Database error";
            likeService.getLikesByPost.mockRejectedValue(
                new Error(errorMessage)
            );

            await likeController.getLikesByPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({
                message: "Failed to fetch likes for post",
                error: errorMessage,
            });
        });
    });

    describe("getLikesByUser", () => {
        it("should return likes by a user", async () => {
            const userId = "user123";
            mockRequest = {
                params: { userId },
            };

            const likes = [mockLike] as ILike[];
            likeService.getLikesByUser.mockResolvedValue(likes);

            await likeController.getLikesByUser(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(likeService.getLikesByUser).toHaveBeenCalledWith(userId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(likes);
        });
    });

    describe("deleteLike", () => {
        it("should delete a like and return success message", async () => {
            mockRequest = {
                params: { id: mockLike._id!.toString() },
            };

            likeService.deleteLike.mockResolvedValue(mockLike as ILike);

            await likeController.deleteLike(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(likeService.deleteLike).toHaveBeenCalledWith(mockLike._id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                message: "Like removed successfully",
            });
        });

        it("should return 404 when like to delete not found", async () => {
            mockRequest = {
                params: { id: new mongoose.Types.ObjectId().toString() },
            };

            likeService.deleteLike.mockResolvedValue(null);

            await likeController.deleteLike(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({ message: "Like not found" });
        });
    });

    describe("toggleLike", () => {
        it("should create a like when none exists", async () => {
            const postId = mockLike.postId!;
            const userId = "user123";
            mockRequest = {
                params: { postId: postId.toString() },
                body: { userId },
            };

            likeService.getUserLikeForPost.mockResolvedValue(null);
            likeService.toggleLike.mockResolvedValue(mockLike as ILike);

            await likeController.toggleLike(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(likeService.toggleLike).toHaveBeenCalledWith(postId, userId);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toEqual(mockLike);
        });

        it("should remove a like when one exists", async () => {
            const postId = mockLike.postId!;
            const userId = "user123";
            mockRequest = {
                params: { postId: postId.toString() },
                body: { userId },
            };

            likeService.toggleLike.mockResolvedValue(null);

            await likeController.toggleLike(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                message: "Like removed successfully",
            });
        });

        it("should return 400 when userId is missing", async () => {
            mockRequest = {
                params: { postId: mockLike.postId!.toString() },
                body: {},
            };

            await likeController.toggleLike(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toEqual({ message: "User ID is required" });
        });
    });

    describe("isPostLikedByUser", () => {
        it("should return true when post is liked by user", async () => {
            const postId = mockLike.postId!;
            const userId = "user123";
            mockRequest = {
                params: { postId: postId.toString() },
                query: { userId },
            };

            likeService.isPostLikedByUser.mockResolvedValue(true);

            await likeController.isPostLikedByUser(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(likeService.isPostLikedByUser).toHaveBeenCalledWith(
                postId,
                userId
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({ isLiked: true });
        });

        it("should return 400 when userId is missing", async () => {
            mockRequest = {
                params: { postId: mockLike.postId!.toString() },
                query: {},
            };

            await likeController.isPostLikedByUser(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toEqual({ message: "User ID is required" });
        });
    });
});
