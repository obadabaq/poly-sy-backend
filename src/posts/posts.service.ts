import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRepository } from './post.repository';
import { User } from 'src/users/user.entity';
import { CreatePostDto } from './helers/create-post-dto';
import { UserRole, UserStatus } from 'src/users/helpers/create-user-dto';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostRepository)
        private readonly postRepository: PostRepository
    ) { }

    async getPosts() {
        let query = this.postRepository.createQueryBuilder('Post')
            .leftJoinAndSelect("Post.user", "user")
            .leftJoinAndSelect("Post.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("Post.dislikedByUsers", "dislikedByUsers");
        let found = await query.getMany();

        return found;
    }

    async addPost(user: User, createPostDto: CreatePostDto) {
        if (user.status == UserStatus.WAITING_FOR_APPROVAL) {
            throw new ForbiddenException('User is not approved yet');
        }
        return await this.postRepository.addPost(createPostDto, user);
    }

    async getActorsWall() {
        let query = this.postRepository.createQueryBuilder('Post')
            .leftJoinAndSelect("Post.user", "user")
            .where("user.role = :role", { role: UserRole.ACTOR });
        let found = await query.getMany();

        return found;
    }

    async getVotersWall() {
        let query = this.postRepository.createQueryBuilder('Post')
            .leftJoinAndSelect("Post.user", "user")
            .where("user.role = :role", { role: UserRole.VOTER });
        let found = await query.getMany();

        return found;
    }

    async likePost(user: User, postId: number) {
        let query = this.postRepository.createQueryBuilder('Post')
            .leftJoinAndSelect("Post.user", "user")
            .leftJoinAndSelect("Post.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("Post.dislikedByUsers", "dislikedByUsers")
            .where("Post.id = :id", { id: postId });
        let found = await query.getOne();
        if (!found) throw new NotFoundException(`Post with ID : ${postId} not found`);

        ///if liked remove like and return
        for (let i = 0; i < found.likedByUsers.length; i++) {
            if (found.likedByUsers[i].id == user.id) {
                let index = found.likedByUsers.indexOf(user);
                found.likedByUsers.splice(index);
                found.numOfLikes -= 1;
                await this.postRepository.save(found);
                return found
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
        await this.postRepository.save(found);
        return found
    }

    async dislikePost(user: User, postId: number) {
        let query = this.postRepository.createQueryBuilder('Post')
            .leftJoinAndSelect("Post.user", "user")
            .leftJoinAndSelect("Post.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("Post.dislikedByUsers", "dislikedByUsers")
            .where("Post.id = :id", { id: postId });
        let found = await query.getOne();
        if (!found) throw new NotFoundException(`Post with ID : ${postId} not found`);
        ///if disliked remove dislike and return
        for (let i = 0; i < found.dislikedByUsers.length; i++) {
            if (found.dislikedByUsers[i].id == user.id) {
                let index = found.dislikedByUsers.indexOf(user);
                found.dislikedByUsers.splice(index);
                found.numOfDislikes -= 1;
                await this.postRepository.save(found);
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
        await this.postRepository.save(found);
        return found
    }

    async deletePost(user: User, id: number) {
        const found = await this.postRepository.findOne({ where: { id: id }, relations: ['user'] });
        if (!found) throw new NotFoundException(`Post with ID ${id} not found`);
        if (found.user.id != user.id) throw new ForbiddenException(`This post is not for this user`);

        let deleted;
        try {
            deleted = await this.postRepository.createQueryBuilder()
                .delete()
                .where("id = :id", { id: found.id })
                .execute();

        }
        catch (e) { }
        return deleted ? true : false;
    }
}
