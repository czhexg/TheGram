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

    it("should find a post by ID", async () => {
        const post = await postRepository.create({
            authorId: "user123",
            content: "Find me",
        });
        const foundPost = await postRepository.findById(post._id!.toString());

        expect(foundPost?._id!.toString()).toEqual(post._id!.toString());
    });

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

    it("should soft delete a post by ID", async () => {
        const post = await postRepository.create({
            authorId: "user123",
            content: "Soft delete me",
        });

        await postRepository.delete(post._id!.toString());
        const foundPost = await postRepository.findById(post._id!.toString());

        expect(foundPost?.status).toBe(Status.DELETED);
    });

    it("should hard delete a post by ID", async () => {
        const post = await postRepository.create({
            authorId: "user123",
            content: "Hard delete me",
        });

        await postRepository.hardDelete(post._id!.toString());
        const foundPost = await postRepository.findById(post._id!.toString());

        expect(foundPost).toBeNull();
    });

    it("should find a post by ID", async () => {
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

    // Add tests for other methods (update, delete, findByAuthor, etc.)
});
