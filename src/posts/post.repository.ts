import { Repository } from "typeorm";
import { CustomRepository } from "src/helpers/database/typeorm-ex.decorator";
import { Post } from "./post.entity";
import { UserRepository } from "src/users/user.repository";
import { CreatePostDto } from "./helers/create-post-dto";
import { User } from "src/users/user.entity";
import { InternalServerErrorException } from "@nestjs/common";

@CustomRepository(Post)
export class PostRepository extends Repository<Post> {

    async addPost(createPostDto: CreatePostDto, user: User): Promise<Post> {
        const { content } = createPostDto;

        const post = new Post();
        post.content = content;
        post.user = user;

        try {
            await this.save(post);
        }
        catch (e) {
            throw new InternalServerErrorException("Error code:" + e.code);
        }
        return post;

    }

}
