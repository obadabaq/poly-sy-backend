import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UserRole, UserStatus } from './helpers/create-user-dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository
    ) { }

    async getUsers() {
        let query = this.userRepository.createQueryBuilder('User')
            .leftJoinAndSelect("User.posts", "posts")
            .leftJoinAndSelect("User.followers", "followers")
            .leftJoinAndSelect("User.following", "following");
        let found = await query.getMany();

        return found;
    }

    async followUser(user: User, userId: number) {
        let query = this.userRepository.createQueryBuilder('User')
            .leftJoinAndSelect("User.followers", "followers")
            .leftJoinAndSelect("User.following", "following")
            .where("User.id = :id", { id: userId });
        let found = await query.getOne();

        if (!found) throw new NotFoundException(`User with ID: ${userId} not found`);
        if (found.role != UserRole.REPRESENTATIVE) throw new ForbiddenException(`You can only follow Representative user`);
        if (found.status != UserStatus.VERIFIED) throw new ForbiddenException(`This user is not verified`);

        ///if followed remove follow and return
        for (let i = 0; i < found.followers.length; i++) {
            if (found.followers[i].id == user.id) {
                let index = found.followers.indexOf(user)
                found.followers.splice(index);
                found.numOfFollowers -= 1;
                user.numOfFollowing -= 1;
                await this.userRepository.save(found);
                await this.userRepository.save(user);
                return found
            }
        }

        found.followers.push(user);
        found.numOfFollowers += 1;
        user.numOfFollowing += 1;
        await this.userRepository.save(found);
        await this.userRepository.save(user);

        return found;
    }

    async getUserPosts(user: User, userId: number) {
        let myUserId = user.id;

        let query = this.userRepository.createQueryBuilder('User')
            .leftJoinAndSelect("User.posts", "posts")
            .leftJoinAndSelect("posts.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("posts.dislikedByUsers", "dislikedByUsers")
            .where("User.id = :userId", { userId });
        let found = await query.getOne();

        return found?.posts.map(post => {
            return {
                ...post,
                hasLiked: post.likedByUsers?.some(u => u.id === myUserId) || false,
                hasDisliked: post.dislikedByUsers?.some(u => u.id === myUserId) || false,
                likedByUsers: undefined,
                dislikedByUsers: undefined
            };
        });
    }

    async getUserComments(user: User, userId: number) {
        let myUserId = user.id;

        let query = this.userRepository.createQueryBuilder('User')
            .leftJoinAndSelect("User.comments", "comments")
            .leftJoinAndSelect("comments.post", "post")
            .leftJoinAndSelect("post.user", "user")
            .leftJoinAndSelect("comments.likedByUsers", "likedByUsers")
            .leftJoinAndSelect("comments.dislikedByUsers", "dislikedByUsers")
            .where("User.id = :userId", { userId });
        let found = await query.getOne();

        return found?.comments.map(comment => {
            return {
                ...comment,
                hasLiked: comment.likedByUsers?.some(u => u.id === myUserId) || false,
                hasDisliked: comment.dislikedByUsers?.some(u => u.id === myUserId) || false,
                likedByUsers: undefined,
                dislikedByUsers: undefined
            };
        });
    }

    async checkUserIsFollowed(user: User, userId: number) {
        let myUserId = user.id;

        let query = this.userRepository.createQueryBuilder('User')
            .leftJoinAndSelect("User.followers", "followers")
            .where("User.id = :userId", { userId });
        let found = await query.getOne();
        for (let i = 0; i < found?.followers.length!; i++) {
            if (found?.followers[i].id == myUserId)
                return true;
        }
        return false;
    }

    async verifyUser(userId: number) {
        let query = this.userRepository.createQueryBuilder('User')
            .where("User.id = :id", { id: userId });
        let found = await query.getOne();

        if (!found) throw new NotFoundException(`User with ID: ${userId} not found`);
        if (found.role != UserRole.REPRESENTATIVE) throw new ForbiddenException(`You can verify Representative users`);
        if (found.status == UserStatus.VERIFIED) throw new ForbiddenException(`This user is verified`);

        found.status = UserStatus.VERIFIED;
        await this.userRepository.save(found);

        return found;
    }


    async deleteUser(id: number) {
        // let phone = await this.jwtStrategy.validateCustomerToken(customer.accessToken);
        // const tokenFound = await this.userRepository.findOne({ where: { phone: phone } });

        const found = await this.userRepository.findOne({ where: { id: id } });
        if (!found) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        // if (found.id != tokenFound.id) {
        //     throw new UnauthorizedException();
        // }
        let deleted;
        try {
            deleted = await this.userRepository.createQueryBuilder()
                .delete()
                .where("id = :id", { id: found.id })
                .execute();

        }
        catch (e) { }
        return deleted ? true : false;
    }
}
