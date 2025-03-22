import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository
    ) { }

    async getUsers() {
        let query = this.userRepository.createQueryBuilder('User')
            .leftJoinAndSelect("User.posts", "posts");
        let found = await query.getMany();

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
