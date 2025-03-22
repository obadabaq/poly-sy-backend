import { User } from "src/users/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @ManyToMany(() => User, user => user.likes, { eager: true, onDelete: "CASCADE" })
    @JoinTable()
    likedByUsers: User[]

    @ManyToMany(() => User, user => user.dislikes, { eager: true, onDelete: "CASCADE" })
    @JoinTable()
    dislikedByUsers: User[]
}
