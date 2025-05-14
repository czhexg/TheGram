import { PostRepository } from "./repositories/post.repository";

export class Container {
    private static instances: { [key: string]: any } = {};

    static getPostRepository(): PostRepository {
        if (!this.instances.postRepository) {
            this.instances.postRepository = new PostRepository();
        }
        return this.instances.postRepository;
    }
}
