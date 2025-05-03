import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Admin } from "src/admins/admin.entity";
import { Comment } from "src/comments/comment.entity";
import { Post } from "src/posts/post.entity";
import { User } from "src/users/user.entity";

export const typeOrmConfig: TypeOrmModuleOptions = {
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        }
    },
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    entities: [User, Admin, Post, Comment],
    synchronize: true
}
