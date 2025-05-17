import { LikeService } from "@src/services/like.service";
import { LikeRepository } from "@src/repositories/like.repository";
import mongoose from "mongoose";
import { ILike } from "@src/models/like.model";

jest.mock("@src/repositories/like.repository");

describe("LikeService", () => {
    let likeService: LikeService;
    let likeRepository: jest.Mocked<LikeRepository>;

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

    beforeEach(() => {
        jest.clearAllMocks();
        likeRepository = new LikeRepository() as jest.Mocked<LikeRepository>;
        likeService = new LikeService(likeRepository);
    });

    describe("createLike", () => {
        it("should create a new like", async () => {
            likeRepository.create.mockResolvedValue(mockLike);

            const result = await likeService.createLike(mockLike);

            expect(likeRepository.create).toHaveBeenCalledWith(
                mockLike,
                undefined
            );
            expect(result).toEqual(mockLike);
        });
    });

    describe("getLikeById", () => {
        it("should return a like by id", async () => {
            likeRepository.findById.mockResolvedValue(mockLike);

            const result = await likeService.getLikeById(
                mockLike._id! as mongoose.Types.ObjectId
            );

            expect(likeRepository.findById).toHaveBeenCalledWith(
                mockLike._id,
                undefined
            );
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
                mockLike.postId,
                undefined
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
                mockLike.userId,
                undefined
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
                mockLike.userId,
                undefined
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
        it("should delete a like", async () => {
            likeRepository.hardDelete.mockResolvedValue(mockLike);

            const result = await likeService.deleteLike(
                mockLike._id! as mongoose.Types.ObjectId
            );

            expect(likeRepository.hardDelete).toHaveBeenCalledWith(
                mockLike._id,
                undefined
            );
            expect(result).toEqual(mockLike);
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
                mockLike.userId,
                undefined
            );
            expect(likeRepository.create).toHaveBeenCalledWith(
                { postId: mockLike.postId, userId: mockLike.userId },
                undefined
            );
            expect(result).toEqual(mockLike);
        });

        it("should delete a like if exists", async () => {
            likeRepository.findByPostAndUser.mockResolvedValue(mockLike);
            likeRepository.hardDelete.mockResolvedValue(mockLike);

            const result = await likeService.toggleLike(
                mockLike.postId!,
                mockLike.userId!
            );

            expect(likeRepository.findByPostAndUser).toHaveBeenCalledWith(
                mockLike.postId,
                mockLike.userId,
                undefined
            );
            expect(likeRepository.hardDelete).toHaveBeenCalledWith(
                mockLike._id,
                undefined
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
