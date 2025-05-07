import { Post } from "src/posts/post.entity";
import { User } from "src/users/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    content: string;

    @ManyToOne(() => User, user => user.comments)
    user: User;

    @ManyToOne(() => Post, post => post.comments)
    post: Post;

    @Column({ nullable: true })
    userArea: string;

    @Column({ nullable: true })
    userAreaEn: string;

    @Column()
    numOfLikes: number;

    @Column()
    numOfDislikes: number;

    @ManyToMany(() => User, user => user.commentsLiked, { eager: true, onDelete: "CASCADE" })
    @JoinTable()
    likedByUsers: User[]

    @ManyToMany(() => User, user => user.commentsDisliked, { eager: true, onDelete: "CASCADE" })
    @JoinTable()
    dislikedByUsers: User[]
}
