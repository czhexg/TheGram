import { PostController } from "@src/controllers/post.controller";
import { PostService } from "@src/services/post.service";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { IPost } from "@src/models/post.model";

jest.mock("@src/services/post.service");

describe("PostController", () => {
    let postController: PostController;
    let postService: jest.Mocked<PostService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    // Mock data
    const mockPost = {
        _id: new mongoose.Types.ObjectId(),
        title: "Test Post",
        content: "This is a test post",
        authorId: "user123",
    } as Partial<IPost> as IPost;

    beforeAll(() => {
        // Initialize the mocked PostService
        postService = new PostService({} as any) as jest.Mocked<PostService>;
        postController = new PostController(postService);
    });

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
                return this;
            }),
        };

        responseObject = {};
    });

    describe("createPost", () => {
        it("should create a new post and return 201 status", async () => {
            mockRequest = {
                body: mockPost,
            };

            postService.createPost.mockResolvedValue(mockPost as IPost);

            await postController.createPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(postService.createPost).toHaveBeenCalledWith(mockPost);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toEqual(mockPost);
        });

        it("should handle errors and return 500 status", async () => {
            mockRequest = {
                body: mockPost,
            };

            const errorMessage = "Database error";
            postService.createPost.mockRejectedValue(new Error(errorMessage));

            await postController.createPost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({
                message: "Failed to create post",
                error: errorMessage,
            });
        });
    });

    describe("getPostById", () => {
        it("should return a post when found", async () => {
            mockRequest = {
                params: { id: mockPost._id!.toString() },
            };

            postService.getPostById.mockResolvedValue(mockPost as IPost);

            await postController.getPostById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(postService.getPostById).toHaveBeenCalledWith(mockPost._id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(mockPost);
        });

        it("should return 404 when post not found", async () => {
            mockRequest = {
                params: { id: new mongoose.Types.ObjectId().toString() },
            };

            postService.getPostById.mockResolvedValue(null);

            await postController.getPostById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({ message: "Post not found" });
        });

        it("should handle invalid ObjectId format", async () => {
            mockRequest = {
                params: { id: "invalid-id" },
            };

            await postController.getPostById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.message).toBe("Failed to fetch post");
        });
    });

    describe("getPostsByAuthor", () => {
        it("should return posts by author", async () => {
            const authorId = "user123";
            mockRequest = {
                params: { authorId },
            };

            const posts = [mockPost, mockPost] as IPost[];
            postService.getPostsByAuthor.mockResolvedValue(posts);

            await postController.getPostsByAuthor(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(postService.getPostsByAuthor).toHaveBeenCalledWith(authorId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(posts);
        });

        it("should handle errors", async () => {
            const authorId = "user123";
            mockRequest = {
                params: { authorId },
            };

            const errorMessage = "Database error";
            postService.getPostsByAuthor.mockRejectedValue(
                new Error(errorMessage)
            );

            await postController.getPostsByAuthor(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject).toEqual({
                message: "Failed to fetch posts",
                error: errorMessage,
            });
        });
    });

    describe("updatePost", () => {
        it("should update a post and return the updated post", async () => {
            const updateData = { content: "Updated Content" };
            mockRequest = {
                params: { id: mockPost._id!.toString() },
                body: updateData,
            };

            const updatedPost = { ...mockPost, ...updateData } as IPost;
            postService.updatePost.mockResolvedValue(updatedPost);

            await postController.updatePost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(postService.updatePost).toHaveBeenCalledWith(
                mockPost._id,
                updateData
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual(updatedPost);
        });

        it("should return 404 when post to update not found", async () => {
            mockRequest = {
                params: { id: new mongoose.Types.ObjectId().toString() },
                body: { title: "Updated Title" },
            };

            postService.updatePost.mockResolvedValue(null);

            await postController.updatePost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({ message: "Post not found" });
        });
    });

    describe("deletePost", () => {
        it("should delete a post and return success message", async () => {
            mockRequest = {
                params: { id: mockPost._id!.toString() },
            };

            postService.deletePost.mockResolvedValue(mockPost as IPost);

            await postController.deletePost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(postService.deletePost).toHaveBeenCalledWith(mockPost._id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                message: "Post deleted successfully",
            });
        });

        it("should return 404 when post to delete not found", async () => {
            mockRequest = {
                params: { id: new mongoose.Types.ObjectId().toString() },
            };

            postService.deletePost.mockResolvedValue(null);

            await postController.deletePost(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({ message: "Post not found" });
        });
    });
});
