import { CommentController } from "./controllers/comment.controller";
import { LikeController } from "./controllers/like.controller";
import { PostController } from "./controllers/post.controller";
import { CommentRepository } from "./repositories/comment.repository";
import { LikeRepository } from "./repositories/like.repository";
import { PostRepository } from "./repositories/post.repository";
import { CommentService } from "./services/comment.service";
import { LikeService } from "./services/like.service";
import { PostService } from "./services/post.service";

export class Container {
    private static instances: { [key: string]: any } = {};

    static getPostRepository(): PostRepository {
        if (!this.instances.postRepository) {
            this.instances.postRepository = new PostRepository();
        }
        return this.instances.postRepository;
    }

    static getLikeRepository(): LikeRepository {
        if (!this.instances.likeRepository) {
            this.instances.likeRepository = new LikeRepository();
        }
        return this.instances.likeRepository;
    }

    static getCommentRepository(): CommentRepository {
        if (!this.instances.commentRepository) {
            this.instances.commentRepository = new CommentRepository();
        }
        return this.instances.commentRepository;
    }

    static getPostService(): PostService {
        if (!this.instances.postService) {
            this.instances.postService = new PostService(
                this.getPostRepository()
            );
        }
        return this.instances.postService;
    }

    static getLikeService(): LikeService {
        if (!this.instances.likeService) {
            this.instances.likeService = new LikeService(
                this.getLikeRepository(),
                this.getPostRepository()
            );
        }
        return this.instances.likeService;
    }

    static getCommentService(): CommentService {
        if (!this.instances.commentService) {
            this.instances.commentService = new CommentService(
                this.getCommentRepository(),
                this.getPostRepository()
            );
        }
        return this.instances.commentService;
    }

    static getPostController(): PostController {
        if (!this.instances.postController) {
            this.instances.postController = new PostController(
                this.getPostService()
            );
        }
        return this.instances.postController;
    }

    static getLikeController(): LikeController {
        if (!this.instances.likeController) {
            this.instances.likeController = new LikeController(
                this.getLikeService()
            );
        }
        return this.instances.likeController;
    }

    static getCommentController(): CommentController {
        if (!this.instances.commentController) {
            this.instances.commentController = new CommentController(
                this.getCommentService()
            );
        }
        return this.instances.commentController;
    }
}
