import { Repository } from "typeorm";
import { CustomRepository } from "src/helpers/database/typeorm-ex.decorator";
import { Post } from "./post.entity";
import { CreatePostDto, WallType } from "./helpers/create-post-dto";
import { User } from "src/users/user.entity";
import { ForbiddenException, InternalServerErrorException } from "@nestjs/common";

@CustomRepository(Post)
export class PostRepository extends Repository<Post> {

    async addPost(createPostDto: CreatePostDto, user: User): Promise<Post> {
        const { content, wallType, city, area } = createPostDto;

        const post = new Post();
        post.content = content;
        post.user = user;
        post.area = area;
        post.userArea = user.area;
        post.userAreaEn = user.areaEn;
        post.city = city;
        post.numOfDislikes = 0;
        post.numOfLikes = 0;
        if (!Object.values(WallType).includes(wallType)) {
            throw new ForbiddenException('wallType should be street or council');
        }
        post.wallType = wallType;

        try {
            await this.save(post);
        }
        catch (e) {
            throw new InternalServerErrorException("Error code:" + e.code);
        }
        return post;

    }

}
