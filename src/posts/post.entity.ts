import { User } from "src/users/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Comment } from "src/comments/comment.entity";
import { WallType } from "./helpers/create-post-dto";

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    content: string;

    @ManyToOne(() => User, user => user.posts)
    user: User;

    @Column()
    numOfLikes: number;

    @Column()
    numOfDislikes: number;

    @Column()
    wallType: WallType;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    area: string;

    @ManyToMany(() => User, user => user.likes, { eager: true, onDelete: "CASCADE" })
    @JoinTable()
    likedByUsers: User[]

    @ManyToMany(() => User, user => user.dislikes, { eager: true, onDelete: "CASCADE" })
    @JoinTable()
    dislikedByUsers: User[]

    @OneToMany(() => Comment, comment => comment.post, { onDelete: "CASCADE" })
    @JoinColumn()
    comments: Comment[];
}
