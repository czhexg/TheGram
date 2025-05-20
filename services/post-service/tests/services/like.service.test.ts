import { LikeService } from "@src/services/like.service";
import { LikeRepository } from "@src/repositories/like.repository";
import { PostRepository } from "@src/repositories/post.repository";
import mongoose from "mongoose";
import { ILike } from "@src/models/like.model";
import { Status } from "@src/models/constants";
import { IPost } from "@src/models/post.model";

jest.mock("@src/repositories/like.repository");
jest.mock("@src/repositories/post.repository");

describe("LikeService", () => {
    let likeService: LikeService;
    let likeRepository: jest.Mocked<LikeRepository>;
    let postRepository: jest.Mocked<PostRepository>;

    // Mock data
    const mockLike = {
        _id: new mongoose.Types.ObjectId(),
        postId: new mongoose.Types.ObjectId(),
        userId: "user123",
    } as Partial<ILike> as ILike;

    const mockLike2 = {
        _id: new mongoose.Types.ObjectId(),
        postId: new mongoose.Types.ObjectId(),
        userId: "user456",
    } as Partial<ILike> as ILike;

    const mockPost = {
        _id: mockLike.postId,
        title: "Test Post",
        content: "Test Content",
        authorId: "user123",
        likeCount: 1,
        commentCount: 0,
        status: Status.ACTIVE,
    } as Partial<IPost> as IPost;

    const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
        withTransaction: jest.fn(),
    } as unknown as mongoose.ClientSession;

    beforeAll(() => {
        likeRepository = new LikeRepository() as jest.Mocked<LikeRepository>;
        postRepository = new PostRepository() as jest.Mocked<PostRepository>;
        likeService = new LikeService(likeRepository, postRepository);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(mongoose, "startSession").mockImplementation(() =>
            Promise.resolve(mockSession)
        );
    });

    describe("createLike", () => {
        it("should create a like and increment post like count", async () => {
            likeRepository.create.mockResolvedValue(mockLike);
            postRepository.incrementCounter.mockResolvedValue(mockPost);

            const result = await likeService.createLike(mockLike);

            expect(result).toEqual(mockLike);
            expect(likeRepository.create).toHaveBeenCalledWith(
                mockLike,
                expect.objectContaining({ session: expect.anything() })
            );
            expect(postRepository.incrementCounter).toHaveBeenCalledWith(
                mockLike.postId,
                "likeCount",
                expect.objectContaining({ session: expect.anything() })
            );

            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).not.toHaveBeenCalled();
        });

        it("should abort transaction if like creation fails", async () => {
            likeRepository.create.mockRejectedValue(new Error("DB error"));

            await expect(likeService.createLike(mockLike)).rejects.toThrow(
                "DB error"
            );

            // Verify transaction flow
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.commitTransaction).not.toHaveBeenCalled();
        });
    });

    describe("getLikeById", () => {
        it("should return a like by id", async () => {
            likeRepository.findById.mockResolvedValue(mockLike);

            const result = await likeService.getLikeById(
                mockLike._id! as mongoose.Types.ObjectId
            );

            expect(likeRepository.findById).toHaveBeenCalledWith(mockLike._id);
            expect(result).toEqual(mockLike);
        });

        it("should return null if like not found", async () => {
            likeRepository.findById.mockResolvedValue(null);

            const result = await likeService.getLikeById(
                mockLike._id! as mongoose.Types.ObjectId
            );

            expect(result).toBeNull();
        });
    });

    describe("getLikesByPost", () => {
        it("should return all likes for a post", async () => {
            const likes = [mockLike, mockLike2];
            likeRepository.findByPost.mockResolvedValue(likes);

            const result = await likeService.getLikesByPost(mockLike.postId!);

            expect(likeRepository.findByPost).toHaveBeenCalledWith(
                mockLike.postId
            );
            expect(result).toEqual(likes);
            expect(result.length).toBe(2);
        });

        it("should return empty array if no likes found", async () => {
            likeRepository.findByPost.mockResolvedValue([]);

            const result = await likeService.getLikesByPost(mockLike.postId!);

            expect(result).toEqual([]);
        });
    });

    describe("getLikesByUser", () => {
        it("should return all likes by a user", async () => {
            const likes = [mockLike];
            likeRepository.findByUser.mockResolvedValue(likes);

            const result = await likeService.getLikesByUser(mockLike.userId!);

            expect(likeRepository.findByUser).toHaveBeenCalledWith(
                mockLike.userId
            );
            expect(result).toEqual(likes);
        });
    });

    describe("getUserLikeForPost", () => {
        it("should return like if user has liked post", async () => {
            likeRepository.findByPostAndUser.mockResolvedValue(mockLike);

            const result = await likeService.getUserLikeForPost(
                mockLike.postId!,
                mockLike.userId!
            );

            expect(likeRepository.findByPostAndUser).toHaveBeenCalledWith(
                mockLike.postId,
                mockLike.userId
            );
            expect(result).toEqual(mockLike);
        });

        it("should return null if user hasn't liked post", async () => {
            likeRepository.findByPostAndUser.mockResolvedValue(null);

            const result = await likeService.getUserLikeForPost(
                mockLike.postId!,
                mockLike.userId!
            );

            expect(result).toBeNull();
        });
    });

    describe("deleteLike", () => {
        it("should delete a like and decreemnt post like count", async () => {
            likeRepository.findById.mockResolvedValue(mockLike);
            likeRepository.hardDelete.mockResolvedValue(mockLike);
            postRepository.decrementCounter.mockResolvedValue({
                ...mockPost,
                likeCount: 0,
            } as IPost);

            const result = await likeService.deleteLike(
                mockLike._id! as mongoose.Types.ObjectId
            );

            expect(result).toEqual(mockLike);
            expect(likeRepository.hardDelete).toHaveBeenCalledWith(
                mockLike._id,
                expect.objectContaining({ session: expect.anything() })
            );
            expect(postRepository.decrementCounter).toHaveBeenCalledWith(
                mockLike.postId,
                "likeCount",
                expect.objectContaining({ session: expect.anything() })
            );

            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).not.toHaveBeenCalled();
        });
    });

    describe("toggleLike", () => {
        it("should create a like if not exists", async () => {
            likeRepository.findByPostAndUser.mockResolvedValue(null);
            likeRepository.create.mockResolvedValue(mockLike);

            const result = await likeService.toggleLike(
                mockLike.postId!,
                mockLike.userId!
            );

            expect(likeRepository.findByPostAndUser).toHaveBeenCalledWith(
                mockLike.postId,
                mockLike.userId
            );
            expect(likeRepository.create).toHaveBeenCalledWith(
                { postId: mockLike.postId, userId: mockLike.userId },
                expect.objectContaining({ session: expect.anything() })
            );
            expect(result).toEqual(mockLike);
        });

        it("should delete a like if exists", async () => {
            likeRepository.findByPostAndUser.mockResolvedValue(mockLike);
            likeRepository.findById.mockResolvedValue(mockLike);
            likeRepository.hardDelete.mockResolvedValue(mockLike);

            const result = await likeService.toggleLike(
                mockLike.postId!,
                mockLike.userId!
            );

            expect(likeRepository.findByPostAndUser).toHaveBeenCalledWith(
                mockLike.postId,
                mockLike.userId
            );
            expect(likeRepository.hardDelete).toHaveBeenCalledWith(
                mockLike._id,
                expect.objectContaining({ session: expect.anything() })
            );
            expect(result).toBeNull();
        });
    });

    describe("isPostLikedByUser", () => {
        it("should return true if post is liked by user", async () => {
            likeRepository.findByPostAndUser.mockResolvedValue(mockLike);

            const result = await likeService.isPostLikedByUser(
                mockLike.postId!,
                mockLike.userId!
            );

            expect(result).toBe(true);
        });

        it("should return false if post is not liked by user", async () => {
            likeRepository.findByPostAndUser.mockResolvedValue(null);

            const result = await likeService.isPostLikedByUser(
                mockLike.postId!,
                mockLike.userId!
            );

            expect(result).toBe(false);
        });
    });
});
