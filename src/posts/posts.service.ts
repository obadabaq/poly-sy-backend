import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRepository } from './post.repository';
import { User } from 'src/users/user.entity';
import { CreatePostDto, WallType } from './helpers/create-post-dto';
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
            .leftJoinAndSelect("Post.dislikedByUsers", "dislikedByUsers")
            .leftJoinAndSelect("Post.comments", "comments");
        let found = await query.getMany();

        return found;
    }

    async getPostComments(user: User, postId: number) {
        const comments = await this.postRepository
            .createQueryBuilder('post')
            .innerJoinAndSelect('post.comments', 'comments')
            .leftJoinAndSelect('comments.user', 'user')
            .leftJoin('comments.likedByUsers', 'likedByUser', 'likedByUser.id = :userId', { userId: user.id })
            .leftJoin('comments.dislikedByUsers', 'dislikedByUser', 'dislikedByUser.id = :userId', { userId: user.id })
            .where('post.id = :postId', { postId })
            .addSelect('CASE WHEN likedByUser.id IS NOT NULL THEN true ELSE false END', 'hasLiked')
            .addSelect('CASE WHEN dislikedByUser.id IS NOT NULL THEN true ELSE false END', 'hasDisliked')
            .orderBy("comments.numOfLikes", "DESC")
            .getRawMany();

        return comments.map(comment => ({
            id: comment.comments_id,
            content: comment.comments_content,
            createdAt: comment.comments_createdAt,
            updatedAt: comment.comments_updatedAt,
            numOfLikes: comment.comments_numOfLikes,
            numOfDislikes: comment.comments_numOfDislikes,
            userArea: comment.comments_userArea,
            userAreaEn: comment.comments_userAreaEn,
            hasLiked: comment.hasLiked,
            hasDisliked: comment.hasDisliked,
            user: {
                id: comment.user_id,
                name: comment.user_name,
                role: comment.user_role,
                city: comment.user_city,
                area: comment.user_area,
                numOfFollowers: comment.user_numOfFollowers,
                numOfFollowing: comment.user_numOfFollowing,
            }
        }));
    }

    async addPost(user: User, createPostDto: CreatePostDto) {
        if (user.status == UserStatus.WAITING_FOR_APPROVAL) {
            throw new ForbiddenException('User is not approved yet');
        }
        return await this.postRepository.addPost(createPostDto, user);
    }

    async getCouncil(user: User, area: string) {
        const userId = user.id;

        let query = this.postRepository.createQueryBuilder('Post')
            .leftJoinAndSelect("Post.user", "user")
            .leftJoinAndSelect("Post.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("Post.dislikedByUsers", "dislikedByUsers")
            .where("Post.wallType = :wallType AND Post.area ILIKE :area", {
                wallType: WallType.COUNCIL,
                area: `%${area}%`
            })
            .orderBy("Post.numOfLikes", "DESC");

        let found = await query.getMany();

        return found.map(post => {
            return {
                ...post,
                hasLiked: post.likedByUsers?.some(u => u.id === userId) || false,
                hasDisliked: post.dislikedByUsers?.some(u => u.id === userId) || false,
                likedByUsers: undefined,
                dislikedByUsers: undefined
            };
        });
    }

    async getStreet(user: User, area: string) {
        const userId = user.id;

        let query = this.postRepository.createQueryBuilder('Post')
            .leftJoinAndSelect("Post.user", "user")
            .leftJoinAndSelect("Post.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("Post.dislikedByUsers", "dislikedByUsers")
            .where("Post.wallType = :wallType AND Post.area ILIKE :area", { wallType: WallType.STREET, area: `%${area}%` })
            .orderBy("Post.numOfLikes", "DESC");

        let found = await query.getMany();

        return found.map(post => {
            return {
                ...post,
                hasLiked: post.likedByUsers?.some(u => u.id === userId) || false,
                hasDisliked: post.dislikedByUsers?.some(u => u.id === userId) || false,
                likedByUsers: undefined,
                dislikedByUsers: undefined
            };
        });
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

    async deletePost(user: any, id: number) {
        const found = await this.postRepository.findOne({ where: { id: id }, relations: ['user'] });
        if (!found) throw new NotFoundException(`Post with ID ${id} not found`);
        if (user instanceof User) {
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
        else {
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
}
