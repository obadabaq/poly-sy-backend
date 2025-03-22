import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CustomRepository } from "src/helpers/database/typeorm-ex.decorator";
import { LogInUserDto } from "./helpers/login-user-dto";

@CustomRepository(User)
export class UserRepository extends Repository<User> {

    async validatePassword(logInUserDto: LogInUserDto): Promise<any> {

        const { phone, password } = logInUserDto;

        const user = await this.createQueryBuilder('User')
            .addSelect('User.password')
            .addSelect('User.salt')
            .where("User.phone = :phone", { phone: phone })
            .getOne();

        if (user && await user.validatePassword(password)) {
            return user;
        }
        else {
            return null;
        }
    }
}
