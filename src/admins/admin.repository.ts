import { Repository } from "typeorm";
import { CustomRepository } from "src/helpers/database/typeorm-ex.decorator";
import { Admin } from "./admin.entity";
import { LogInAdminDto } from "./helpers/login-admin-dto";

@CustomRepository(Admin)
export class AdminRepository extends Repository<Admin> {

    async validatePassword(logInAdminDto: LogInAdminDto): Promise<any> {

        const { username, password } = logInAdminDto;

        const admin = await this.createQueryBuilder('Admin')
            .addSelect('Admin.password')
            .addSelect('Admin.salt')
            .where("Admin.username = :username", { username })
            .getOne();

        if (admin && await admin.validatePassword(password)) {
            return admin;
        }
        else {
            return null;
        }
    }
}
