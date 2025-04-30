import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole, UserStatus } from "./helpers/create-user-dto";
import * as bcrypt from 'bcrypt';
import { Post } from "src/posts/post.entity";
import { Comment } from "src/comments/comment.entity";

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
    name: string;

    @Column()
    role: UserRole;

    @Column()
    status: UserStatus;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    area: string;

    @Column({ nullable: true })
    idVerification: string;

    @Column({ select: false })
    password: string;

    @Column({ select: false })
    salt: string;

    @ManyToMany(() => User, user => user.following, { onDelete: "CASCADE" })
    @JoinTable()
    followers: User[];

    @ManyToMany(() => User, user => user.followers, { onDelete: "CASCADE" })
    following: User[];

    @Column({ nullable: true })
    numOfFollowers: number;

    @Column({ nullable: true })
    numOfFollowing: number;

    @OneToMany(() => Post, post => post.user, { onDelete: "CASCADE" })
    @JoinColumn()
    posts: Post[];

    @ManyToMany(() => Post, post => post.likedByUsers, { onDelete: "CASCADE" })
    likes: Post[];

    @ManyToMany(() => Post, post => post.dislikedByUsers, { onDelete: "CASCADE" })
    dislikes: Post[];

    @OneToMany(() => Comment, comment => comment.user, { onDelete: "CASCADE" })
    @JoinColumn()
    comments: Comment[];

    @ManyToMany(() => Comment, comment => comment.likedByUsers, { onDelete: "CASCADE" })
    commentsLiked: Comment[];

    @ManyToMany(() => Comment, comment => comment.dislikedByUsers, { onDelete: "CASCADE" })
    commentsDisliked: Comment[];

    @DeleteDateColumn()
    deletedAt?: Date;

    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }
}
