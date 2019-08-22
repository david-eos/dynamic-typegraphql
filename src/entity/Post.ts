import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { User } from "./User";
import { Page } from "./Page";

@ObjectType()
@Entity()
export class Post {

    @Field(() => Int)
    @PrimaryGeneratedColumn({ type: "bigint" })
    public postId: number;

    @Field(() => Int)
    @Column({ type: "bigint" })
    public userId: string;

    @Field()
    @Column()
    public title: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn({ name: "userId", referencedColumnName: "userId" })
    public author: Promise<User>;

    @Field(() => [Page], { nullable: true })
    @OneToMany(() => Page, (page) => page.post)
    @JoinColumn({ name: "postId", referencedColumnName: "postId" })
    public pages: Promise<Page[]>;
}
