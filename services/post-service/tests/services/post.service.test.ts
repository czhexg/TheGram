import { PostService } from "@src/services/post.service";
import { PostRepository } from "@src/repositories/post.repository";
import { Status } from "@src/models/constants";
import { IPost } from "@src/models/post.model";
import mongoose from "mongoose";

jest.mock("@src/repositories/post.repository");

describe("PostService", () => {
    let postService: PostService;
    let postRepository: jest.Mocked<PostRepository>;

    const mockPostId = new mongoose.Types.ObjectId();
    const mockPost = {
        _id: mockPostId,
        title: "Test Post",
        content: "Test Content",
        authorId: "user123",
        likeCount: 0,
        commentCount: 0,
        status: Status.ACTIVE,
    } as Partial<IPost> as IPost;

    beforeEach(() => {
        jest.clearAllMocks();
        postRepository = new PostRepository() as jest.Mocked<PostRepository>;
        postService = new PostService(postRepository);
    });

    describe("createPost", () => {
        it("should create a new post", async () => {
            postRepository.create.mockResolvedValue(mockPost);

            const result = await postService.createPost(mockPost);

            expect(postRepository.create).toHaveBeenCalledWith(mockPost);
            expect(result).toEqual(mockPost);
        });
    });

    describe("getPostById", () => {
        it("should return a post by id", async () => {
            postRepository.findById.mockResolvedValue(mockPost);

            const result = await postService.getPostById(mockPostId);

            expect(postRepository.findById).toHaveBeenCalledWith(mockPostId);
            expect(result).toEqual(mockPost);
        });

        it("should return null if post not found", async () => {
            postRepository.findById.mockResolvedValue(null);

            const result = await postService.getPostById(
                new mongoose.Types.ObjectId()
            );

            expect(result).toBeNull();
        });
    });

    describe("getPostsByAuthor", () => {
        it("should return posts by author", async () => {
            const posts = [mockPost];
            postRepository.findByAuthor.mockResolvedValue(posts);

            const result = await postService.getPostsByAuthor("user123");

            expect(postRepository.findByAuthor).toHaveBeenCalledWith("user123");
            expect(result).toEqual(posts);
        });

        it("should return empty array if no posts found", async () => {
            postRepository.findByAuthor.mockResolvedValue([]);

            const result = await postService.getPostsByAuthor("user456");

            expect(result).toEqual([]);
        });
    });

    describe("updatePost", () => {
        it("should update a post", async () => {
            const updatedPost = {
                ...mockPost,
                title: "Updated Title",
            } as Partial<IPost> as IPost;
            postRepository.update.mockResolvedValue(updatedPost);

            const result = await postService.updatePost(mockPostId, {
                content: "Updated content",
            });

            expect(postRepository.update).toHaveBeenCalledWith(mockPostId, {
                content: "Updated content",
            });
            expect(result).toEqual(updatedPost);
        });

        it("should return null if post does not exist", async () => {
            postRepository.update.mockResolvedValue(null);

            const result = await postService.updatePost(
                new mongoose.Types.ObjectId(),
                {
                    content: "Updated content",
                }
            );

            expect(result).toBeNull();
        });
    });

    describe("deletePost", () => {
        it("should mark a post as deleted", async () => {
            const deletedPost = {
                ...mockPost,
                status: Status.DELETED,
            } as Partial<IPost> as IPost;
            postRepository.delete.mockResolvedValue(deletedPost);

            const result = await postService.deletePost(mockPostId);

            expect(postRepository.delete).toHaveBeenCalledWith(mockPostId);
            expect(result).toEqual(deletedPost);
        });

        it("should return null if post does not exist", async () => {
            postRepository.delete.mockResolvedValue(null);

            const result = await postService.deletePost(
                new mongoose.Types.ObjectId()
            );

            expect(result).toBeNull();
        });
    });

    describe("updateLikeCounter", () => {
        it("should increment like count", async () => {
            const likedPost = {
                ...mockPost,
                likeCount: 1,
            } as Partial<IPost> as IPost;
            postRepository.incrementCounter.mockResolvedValue(likedPost);

            const result = await postService.updateLikeCounter(
                mockPostId,
                "increment"
            );

            expect(postRepository.incrementCounter).toHaveBeenCalledWith(
                mockPostId,
                "likeCount",
                undefined
            );
            expect(result).toEqual(likedPost);
        });

        it("should decrement like count", async () => {
            const unlikedPost = {
                ...mockPost,
                likeCount: -1,
            } as Partial<IPost> as IPost;
            postRepository.decrementCounter.mockResolvedValue(unlikedPost);

            const result = await postService.updateLikeCounter(
                mockPostId,
                "decrement"
            );

            expect(postRepository.decrementCounter).toHaveBeenCalledWith(
                mockPostId,
                "likeCount",
                undefined
            );
            expect(result).toEqual(unlikedPost);
        });

        it("should return null if post does not exist", async () => {
            postRepository.decrementCounter.mockResolvedValue(null);

            const result = await postService.updateLikeCounter(
                new mongoose.Types.ObjectId(),
                "decrement"
            );

            expect(result).toBeNull();
        });
    });

    describe("updateCommentCounter", () => {
        it("should increment comment count", async () => {
            const commentedPost = {
                ...mockPost,
                commentCount: 1,
            } as Partial<IPost> as IPost;
            postRepository.incrementCounter.mockResolvedValue(commentedPost);

            const result = await postService.updateCommentCounter(
                mockPostId,
                "increment"
            );

            expect(postRepository.incrementCounter).toHaveBeenCalledWith(
                mockPostId,
                "commentCount",
                undefined
            );
            expect(result).toEqual(commentedPost);
        });

        it("should decrement comment count", async () => {
            const uncommentedPost = {
                ...mockPost,
                commentCount: -1,
            } as Partial<IPost> as IPost;
            postRepository.decrementCounter.mockResolvedValue(uncommentedPost);

            const result = await postService.updateCommentCounter(
                mockPostId,
                "decrement"
            );

            expect(postRepository.decrementCounter).toHaveBeenCalledWith(
                mockPostId,
                "commentCount",
                undefined
            );
            expect(result).toEqual(uncommentedPost);
        });

        it("should return null if post does not exist", async () => {
            postRepository.decrementCounter.mockResolvedValue(null);

            const result = await postService.updateCommentCounter(
                new mongoose.Types.ObjectId(),
                "decrement"
            );

            expect(result).toBeNull();
        });
    });
});
