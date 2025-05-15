import "dotenv/config";

import mongoose from "mongoose";
import { PostRepository } from "@src/repositories/post.repository";
import { Container } from "@src/container";
import { Post } from "@src/models/post.model";
import { Status } from "@src/models/constants";

describe("PostRepository", () => {
    let postRepository: PostRepository;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_DB_TEST_URI!);
        postRepository = Container.getPostRepository();
    });

    afterAll(async () => {
        await Post.deleteMany({}); // Cleanup
        await mongoose.disconnect();
    });

    describe("create", () => {
        it("should create a post", async () => {
            const postData = {
                authorId: "user123",
                content: "Test post",
                hashtags: ["test#1", "test#2"],
                images: ["test.jpg"],
                status: Status.ACTIVE,
            };
            const post = await postRepository.create(postData);

            expect(post).toHaveProperty("_id");
            expect(post.content).toBe("Test post");
            expect(post.hashtags).toEqual(["test#1", "test#2"]);
            expect(post.images).toEqual(["test.jpg"]);
            expect(post.status).toBe(Status.ACTIVE);
            expect(post.likeCount).toBe(0);
            expect(post.commentCount).toBe(0);
            expect(post).toHaveProperty("createdAt");
            expect(post).toHaveProperty("updatedAt");
        });
    });

    describe("update", () => {
        it("should update a post by ID", async () => {
            const post = await postRepository.create({
                authorId: "user123",
                content: "Update me",
            });

            const updatedData = {
                content: "Updated post",
                hashtags: ["test#1", "test#2"],
            };
            const updatedPost = await postRepository.update(
                post._id!.toString(),
                updatedData
            );

            expect(updatedPost?._id!.toString()).toEqual(post._id!.toString());
            expect(updatedPost?.content).toBe("Updated post");
            expect(updatedPost?.hashtags).toEqual(["test#1", "test#2"]);
        });

        it("should return null when post doesnt exist", async () => {
            const updatedData = {
                content: "Updated post",
                hashtags: ["test#1", "test#2"],
            };
            const updatedPost = await postRepository.update(
                new mongoose.Types.ObjectId().toString(),
                updatedData
            );
            expect(updatedPost).toBeNull();
        });
    });

    describe("delete", () => {
        describe("soft delete", () => {
            it("should soft delete a post by ID", async () => {
                const post = await postRepository.create({
                    authorId: "user123",
                    content: "Soft delete me",
                });

                await postRepository.delete(post._id!.toString());
                const foundPost = await postRepository.findById(
                    post._id!.toString()
                );

                expect(foundPost?.status).toBe(Status.DELETED);
            });

            it("should return null when post doesnt exist", async () => {
                const post = await postRepository.delete(
                    new mongoose.Types.ObjectId().toString()
                );
                expect(post).toBeNull();
            });
        });

        describe("hard delete", () => {
            it("should hard delete a post by ID", async () => {
                const post = await postRepository.create({
                    authorId: "user123",
                    content: "Hard delete me",
                });

                await postRepository.hardDelete(post._id!.toString());
                const foundPost = await postRepository.findById(
                    post._id!.toString()
                );

                expect(foundPost).toBeNull();
            });

            it("should return null when post doesnt exist", async () => {
                const post = await postRepository.hardDelete(
                    new mongoose.Types.ObjectId().toString()
                );
                expect(post).toBeNull();
            });
        });
    });

    describe("findById", () => {
        it("should find a post by ID", async () => {
            const post = await postRepository.create({
                authorId: "user123",
                content: "Find me",
            });
            const foundPost = await postRepository.findById(
                post._id!.toString()
            );

            expect(foundPost?._id!.toString()).toEqual(post._id!.toString());
        });

        it("should return null when post doesnt exist", async () => {
            const foundPost = await postRepository.findById(
                new mongoose.Types.ObjectId().toString()
            );
            expect(foundPost).toBeNull();
        });
    });

    describe("findByAuthor", () => {
        it("should find a post by Author", async () => {
            const authorId = "user123ToBeFound";
            await postRepository.create({
                authorId: "user123ToBeFound",
                content: "Find me by authorId 1",
            });
            await postRepository.create({
                authorId: "user123ToBeFound",
                content: "Find me by authorId 2",
            });
            const foundPosts = await postRepository.findByAuthor(authorId);

            for (const foundPost of foundPosts) {
                expect(foundPost.authorId).toEqual(authorId);
            }
        });

        it("should return empty array when user does not have any posts", async () => {
            const foundPosts = await postRepository.findByAuthor(
                "non-existent-author"
            );
            expect(foundPosts).toEqual([]);
        });
    });

    describe("incrementCounter", () => {
        it("should increment like counter", async () => {
            const post = await postRepository.create({
                authorId: "user123",
                content: "Like me",
            });

            const likedPost = await postRepository.incrementCounter(
                post._id!.toString(),
                "likeCount"
            );

            expect(likedPost?.likeCount).toBe(1);
        });

        it("should increment comment counter", async () => {
            const post = await postRepository.create({
                authorId: "user123",
                content: "Comment me",
            });

            const commentedPost = await postRepository.incrementCounter(
                post._id!.toString(),
                "commentCount"
            );

            expect(commentedPost?.commentCount).toBe(1);
        });

        it("should return null when post doesnt exist", async () => {
            const post = await postRepository.incrementCounter(
                new mongoose.Types.ObjectId().toString(),
                "likeCount"
            );
            expect(post).toBeNull();
        });
    });

    describe("decrementCounter", () => {
        it("should decrement like counter", async () => {
            const post = await postRepository.create({
                authorId: "user123",
                content: "Unlike me",
                likeCount: 1,
            });

            const unlikedPost = await postRepository.decrementCounter(
                post._id!.toString(),
                "likeCount"
            );

            expect(unlikedPost?.likeCount).toBe(0);
        });

        it("should decrement comment counter", async () => {
            const post = await postRepository.create({
                authorId: "user123",
                content: "Uncomment me",
                commentCount: 1,
            });

            const uncommentedPost = await postRepository.decrementCounter(
                post._id!.toString(),
                "commentCount"
            );

            expect(uncommentedPost?.commentCount).toBe(0);
        });

        it("should return null when post doesnt exist", async () => {
            const post = await postRepository.decrementCounter(
                new mongoose.Types.ObjectId().toString(),
                "likeCount"
            );
            expect(post).toBeNull();
        });
    });
});
