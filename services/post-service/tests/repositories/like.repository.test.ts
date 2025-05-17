import "dotenv/config";

import mongoose from "mongoose";
import { LikeRepository } from "@src/repositories/like.repository";
import { Like } from "@src/models/like.model";
import { Container } from "@src/container";

describe("LikeRepository", () => {
    let likeRepository: LikeRepository;
    const testUserId = "user123";
    const testPostId = new mongoose.Types.ObjectId();

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_DB_TEST_URI!);
        likeRepository = Container.getLikeRepository();
    });

    afterEach(async () => {
        // Clean up between tests
        await Like.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe("create", () => {
        it("should create a like", async () => {
            const like = await likeRepository.create({
                postId: testPostId,
                userId: testUserId,
            });

            expect(like).toHaveProperty("_id");
            expect(like.postId).toEqual(testPostId);
            expect(like.userId).toBe(testUserId);
        });

        it("should prevent duplicate likes", async () => {
            // First like should succeed
            await likeRepository.create({
                postId: testPostId,
                userId: testUserId,
            });

            // Second like should throw
            await expect(
                likeRepository.create({
                    postId: testPostId,
                    userId: testUserId,
                })
            ).rejects.toThrow(mongoose.mongo.MongoServerError); // MongoServerError: Duplicate key
        });
    });

    describe("findByPost", () => {
        it("should find all likes for a post", async () => {
            // Create 2 likes for the same post
            await likeRepository.create({
                postId: testPostId,
                userId: "user1",
            });
            await likeRepository.create({
                postId: testPostId,
                userId: "user2",
            });

            const likes = await likeRepository.findByPost(testPostId);
            expect(likes).toHaveLength(2);

            for (const like of likes) {
                expect(like.postId).toEqual(testPostId);
            }
        });

        it("should return empty array for post with no likes", async () => {
            const likes = await likeRepository.findByPost(
                new mongoose.Types.ObjectId()
            );
            expect(likes).toEqual([]);
        });
    });

    describe("findByUser", () => {
        it("should find all likes by a user", async () => {
            // Create 2 likes for the same user
            await likeRepository.create({
                postId: testPostId,
                userId: testUserId,
            });
            await likeRepository.create({
                postId: new mongoose.Types.ObjectId(),
                userId: testUserId,
            });
            const likes = await likeRepository.findByUser(testUserId);
            expect(likes).toHaveLength(2);
            for (const like of likes) {
                expect(like.userId.toString()).toBe(testUserId);
            }
        });

        it("should return empty array for user that did not like any post", async () => {
            const likes = await likeRepository.findByUser(testUserId);
            expect(likes).toEqual([]);
        });
    });

    describe("findByPostAndUser", () => {
        it("should find a like by post and user", async () => {
            const createdLike = await likeRepository.create({
                postId: testPostId,
                userId: testUserId,
            });

            const foundLike = await likeRepository.findByPostAndUser(
                testPostId,
                testUserId
            );

            expect(foundLike).not.toBeNull();
            expect(foundLike?._id!.toString()).toEqual(
                createdLike._id!.toString()
            );
        });

        it("should return null when like doesnt exist", async () => {
            const foundLike = await likeRepository.findByPostAndUser(
                new mongoose.Types.ObjectId(),
                "nonexistent-user-id"
            );
            expect(foundLike).toBeNull();
        });
    });

    describe("delete", () => {
        it("should hard delete a like", async () => {
            const like = await likeRepository.create({
                postId: testPostId,
                userId: testUserId,
            });

            await likeRepository.hardDelete(
                like._id as mongoose.Types.ObjectId
            );

            const foundLike = await Like.findById(like._id);
            expect(foundLike).toBeNull();
        });

        it("should return null when deleting non-existent like", async () => {
            const result = await likeRepository.hardDelete(
                new mongoose.Types.ObjectId()
            );
            expect(result).toBeNull();
        });
    });
});
