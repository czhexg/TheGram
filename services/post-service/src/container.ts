import { CommentRepository } from "./repositories/comment.repository";
import { LikeRepository } from "./repositories/like.repository";
import { PostRepository } from "./repositories/post.repository";

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
}
