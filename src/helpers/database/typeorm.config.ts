import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "src/users/user.entity";

export const typeOrmConfig: TypeOrmModuleOptions = {
    ssl: false,
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'anaobada',
    database: 'polysy',
    entities: [User],
    synchronize: true
}
