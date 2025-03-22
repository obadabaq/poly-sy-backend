import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRepository } from 'src/posts/post.repository';
import { CommentRepository } from './comment.repository';
import { User } from 'src/users/user.entity';
import { CreateCommentDto } from './helpers/create-comment-dto';
import { UserStatus } from 'src/users/helpers/create-user-dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(CommentRepository)
        private readonly commentRepository: CommentRepository,
        @InjectRepository(PostRepository)
        private readonly postRepository: PostRepository
    ) { }

    async getComments() {
        let query = this.commentRepository.createQueryBuilder('Comment')
            .leftJoinAndSelect("Comment.user", "user")
            .leftJoinAndSelect("Comment.post", "post")
            .leftJoinAndSelect("Comment.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("Comment.dislikedByUsers", "dislikedByUsers");
        let found = await query.getMany();

        return found;
    }

    async addComment(user: User, createCommentDto: CreateCommentDto) {
        if (user.status == UserStatus.WAITING_FOR_APPROVAL) {
            throw new ForbiddenException('User is not approved yet');
        }
        return await this.commentRepository.addComment(createCommentDto, user, this.postRepository);
    }

    async likeComment(user: User, commentId: number) {
        let query = this.commentRepository.createQueryBuilder('Comment')
            .leftJoinAndSelect("Comment.user", "user")
            .leftJoinAndSelect("Comment.post", "post")
            .leftJoinAndSelect("Comment.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("Comment.dislikedByUsers", "dislikedByUsers")
            .where("Comment.id = :id", { id: commentId });
        let found = await query.getOne();
        if (!found) throw new NotFoundException(`Comment with ID : ${commentId} not found`);

        ///if liked remove like and return
        for (let i = 0; i < found.likedByUsers.length; i++) {
            if (found.likedByUsers[i].id == user.id) {
                let index = found.likedByUsers.indexOf(user);
                found.likedByUsers.splice(index);
                found.numOfLikes -= 1;
                await this.commentRepository.save(found);
                return found;
            }
        }

        ///if disliked remove dislike
        for (let i = 0; i < found.dislikedByUsers.length; i++) {
            if (found.dislikedByUsers[i].id == user.id) {
                let index = found.dislikedByUsers.indexOf(user);
                found.dislikedByUsers.splice(index);
                found.numOfDislikes -= 1;
            }
        }
        ///add to liked
        found.likedByUsers.push(user);
        found.numOfLikes += 1;
        await this.commentRepository.save(found);
        return found
    }

    async dislikeComment(user: User, commentId: number) {
        let query = this.commentRepository.createQueryBuilder('Comment')
            .leftJoinAndSelect("Comment.user", "user")
            .leftJoinAndSelect("Comment.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("Comment.dislikedByUsers", "dislikedByUsers")
            .where("Comment.id = :id", { id: commentId });
        let found = await query.getOne();
        if (!found) throw new NotFoundException(`Comment with ID : ${commentId} not found`);
        ///if disliked remove dislike and return
        for (let i = 0; i < found.dislikedByUsers.length; i++) {
            if (found.dislikedByUsers[i].id == user.id) {
                let index = found.dislikedByUsers.indexOf(user);
                found.dislikedByUsers.splice(index);
                found.numOfDislikes -= 1;
                await this.commentRepository.save(found);
                return found
            }
        }

        ///if liked remove like
        for (let i = 0; i < found.likedByUsers.length; i++) {
            if (found.likedByUsers[i].id == user.id) {
                let index = found.likedByUsers.indexOf(user);
                found.likedByUsers.splice(index);
                found.numOfLikes -= 1;
            }
        }
        ///add to disliked
        found.dislikedByUsers.push(user);
        found.numOfDislikes += 1;
        await this.commentRepository.save(found);
        return found
    }

    async deleteComment(user: User, id: number) {
        const found = await this.commentRepository.findOne({ where: { id: id }, relations: ['user'] });
        if (!found) throw new NotFoundException(`Comment with ID ${id} not found`);
        if (found.user.id != user.id) throw new ForbiddenException(`This comment is not for this user`);

        let deleted;
        try {
            deleted = await this.commentRepository.createQueryBuilder()
                .delete()
                .where("id = :id", { id: found.id })
                .execute();

        }
        catch (e) { }
        return deleted ? true : false;
    }
}
