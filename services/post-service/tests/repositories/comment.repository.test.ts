import "dotenv/config";

import mongoose from "mongoose";
import { CommentRepository } from "@src/repositories/comment.repository";
import { Comment, IComment } from "@src/models/comment.model";
import { Status } from "@src/models/constants";

describe("CommentRepository", () => {
    let commentRepository: CommentRepository;
    const testPostId = new mongoose.Types.ObjectId().toString();
    const testAuthorId = "user123";
    const testCommentText = "Test comment";

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_DB_TEST_URI!);
        commentRepository = new CommentRepository();
    });

    afterEach(async () => {
        await Comment.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe("create", () => {
        it("should create a top-level comment", async () => {
            const comment = await commentRepository.create({
                postId: testPostId,
                authorId: testAuthorId,
                text: testCommentText,
            });

            expect(comment).toHaveProperty("_id");
            expect(comment.postId.toString()).toBe(testPostId);
            expect(comment.text).toBe(testCommentText);
            expect(comment.parentCommentId).toBeNull();
        });

        it("should create a nested comment", async () => {
            const parentComment = await commentRepository.create({
                postId: testPostId,
                authorId: testAuthorId,
                text: "Parent comment",
            });

            const childComment = await commentRepository.create({
                postId: testPostId,
                authorId: "user456",
                text: "Reply comment",
                parentCommentId: parentComment._id,
            });

            expect(childComment.parentCommentId?.toString()).toBe(
                parentComment._id!.toString()
            );
        });
    });

    describe("findByPost", () => {
        it("should find comments for a post", async () => {
            // Create 2 comments for test post and 1 for another post
            await Promise.all([
                commentRepository.create({
                    postId: testPostId,
                    authorId: testAuthorId,
                    text: "Comment 1",
                }),
                commentRepository.create({
                    postId: testPostId,
                    authorId: "user456",
                    text: "Comment 2",
                }),
                commentRepository.create({
                    postId: new mongoose.Types.ObjectId().toString(),
                    authorId: testAuthorId,
                    text: "Other post comment",
                }),
            ]);

            const comments = await commentRepository.findByPost(testPostId);
            expect(comments).toHaveLength(2);
            expect(comments[0].postId.toString()).toBe(testPostId);
        });

        it("should return empty array for post with no comments", async () => {
            const comments = await commentRepository.findByPost(
                new mongoose.Types.ObjectId().toString()
            );
            expect(comments).toEqual([]);
        });
    });

    describe("findReplies", () => {
        it("should find replies to a comment", async () => {
            const parentComment = await commentRepository.create({
                postId: testPostId,
                authorId: testAuthorId,
                text: "Parent comment",
            });

            // Create 2 replies
            await Promise.all([
                commentRepository.create({
                    postId: testPostId,
                    authorId: "user456",
                    text: "Reply 1",
                    parentCommentId: parentComment._id,
                }),
                commentRepository.create({
                    postId: testPostId,
                    authorId: "user789",
                    text: "Reply 2",
                    parentCommentId: parentComment._id,
                }),
            ]);

            // Create a non-reply comment (shouldn't be included)
            await commentRepository.create({
                postId: testPostId,
                authorId: testAuthorId,
                text: "Another top-level comment",
            });

            const replies = await commentRepository.findReplies(
                parentComment._id!.toString()
            );
            expect(replies).toHaveLength(2);
            replies.forEach((reply) => {
                expect(reply.parentCommentId?.toString()).toBe(
                    parentComment._id!.toString()
                );
            });
        });

        it("should return empty array for comment with no replies", async () => {
            const comment = await commentRepository.create({
                postId: testPostId,
                authorId: testAuthorId,
                text: "Lonely comment",
            });

            const replies = await commentRepository.findReplies(
                comment._id!.toString()
            );
            expect(replies).toEqual([]);
        });
    });

    describe("findByAuthor", () => {
        it("should find comments by author", async () => {
            // Create 2 comments by test author and 1 by another author
            await Promise.all([
                commentRepository.create({
                    postId: testPostId,
                    authorId: testAuthorId,
                    text: "Comment 1",
                }),
                commentRepository.create({
                    postId: new mongoose.Types.ObjectId().toString(),
                    authorId: testAuthorId,
                    text: "Comment 2",
                }),
                commentRepository.create({
                    postId: testPostId,
                    authorId: "other-user",
                    text: "Other user comment",
                }),
            ]);

            const comments = await commentRepository.findByAuthor(testAuthorId);
            expect(comments).toHaveLength(2);
            comments.forEach((comment) => {
                expect(comment.authorId).toBe(testAuthorId);
            });
        });
    });

    describe("delete", () => {
        describe("soft delete", () => {
            it("should soft delete a comment", async () => {
                const comment = await commentRepository.create({
                    postId: testPostId,
                    authorId: testAuthorId,
                    text: testCommentText,
                });

                const deletedComment = await commentRepository.delete(
                    comment._id!.toString()
                );
                expect(deletedComment).not.toBeNull();

                const foundComment = await Comment.findById(comment._id);
                expect(foundComment?.status).toBe(Status.DELETED);
            });

            it("should return null when deleting non-existent comment", async () => {
                const result = await commentRepository.delete(
                    new mongoose.Types.ObjectId().toString()
                );
                expect(result).toBeNull();
            });
        });

        describe("hard delete", () => {
            it("should hard delete a comment", async () => {
                const comment = await commentRepository.create({
                    postId: testPostId,
                    authorId: testAuthorId,
                    text: testCommentText,
                });

                await commentRepository.hardDelete(comment._id!.toString());

                const foundComment = await Comment.findById(comment._id);
                expect(foundComment).toBeNull();
            });

            it("should return null when deleting non-existent comment", async () => {
                const result = await commentRepository.hardDelete(
                    new mongoose.Types.ObjectId().toString()
                );
                expect(result).toBeNull();
            });
        });
    });
});
