import { ArgsType, Field, Int } from "type-graphql";
import { Post } from "../entity/Post";
import { BaseFilterArgs } from "./BaseFilterArgs";

/**
 * Arg fields needed to identify ONE instance of Post
 */
@ArgsType()
export class PostArgs implements Partial<Post> {

    @Field(() => Int)
    public postId: number;
}

/**
 * Unnecessary (nullable) arg fields to filter posts as you want
 */
@ArgsType()
export class PostFilterArgs extends BaseFilterArgs implements Partial<Post> {

    @Field(() => Int, { nullable: true })
    public postId?: number;

    @Field({ nullable: true })
    public title: string;
}
