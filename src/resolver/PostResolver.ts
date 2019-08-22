import { Resolver } from "type-graphql";
import { Post } from "../entity/Post";
import { createBaseResolver } from "./BaseResolver";
import { PostArgs, PostFilterArgs } from "../arg/PostArgs";

const BasePostResolver = createBaseResolver("Post", "Posts", Post, PostArgs, PostFilterArgs);

@Resolver(Post)
export class PostResolver extends BasePostResolver {
}
