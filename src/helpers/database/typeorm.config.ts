import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Admin } from "src/admins/admin.entity";
import { Comment } from "src/comments/comment.entity";
import { Post } from "src/posts/post.entity";
import { User } from "src/users/user.entity";

export const typeOrmConfig: TypeOrmModuleOptions = {
    ssl: false,
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: "polysy",
    entities: [User, Admin, Post, Comment],
    synchronize: true
}
