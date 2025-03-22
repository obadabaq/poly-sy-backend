import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole, UserStatus } from "./helpers/create-user-dto";
import * as bcrypt from 'bcrypt';
import { Post } from "src/posts/post.entity";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ select: false })
    accessToken: string;

    @Column({ unique: true })
    phone: string;

    @Column()
    role: UserRole;

    @Column()
    status: UserStatus;

    @Column({ select: false })
    password: string;

    @Column({ select: false })
    salt: string;

    @OneToMany(() => Post, post => post.user, { onDelete: "CASCADE" })
    @JoinColumn()
    posts: Post[];

    @ManyToMany(() => Post, post => post.likedByUsers, { onDelete: "CASCADE" })
    likes: Post[];

    @ManyToMany(() => Post, post => post.dislikedByUsers, { onDelete: "CASCADE" })
    dislikes: Post[];

    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }
}
