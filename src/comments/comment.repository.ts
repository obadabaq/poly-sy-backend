import { Repository } from "typeorm";
import { CustomRepository } from "src/helpers/database/typeorm-ex.decorator";
import { User } from "src/users/user.entity";
import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Comment } from "./comment.entity";
import { CreateCommentDto } from "./helpers/create-comment-dto";
import { PostRepository } from "src/posts/post.repository";

@CustomRepository(Comment)
export class CommentRepository extends Repository<Comment> {

    async addComment(createCommentDto: CreateCommentDto, user: User, postRepository: PostRepository): Promise<Comment> {
        const { content, postId, userArea, userAreaEn } = createCommentDto;
        let post = await postRepository.findOne({ where: { id: postId } });
        if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

        const comment = new Comment();
        comment.content = content;
        comment.post = post;
        comment.user = user;
        comment.userArea = userArea;
        comment.userAreaEn = userAreaEn;
        comment.numOfDislikes = 0;
        comment.numOfLikes = 0;

        try {
            await this.save(comment);
        }
        catch (e) {
            throw new InternalServerErrorException("Error code:" + e.code);
        }
        return comment;

    }

}
