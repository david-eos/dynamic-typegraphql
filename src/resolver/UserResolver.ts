import { Resolver } from "type-graphql";
import { User } from "../entity/User";
import { createBaseResolver } from "./BaseResolver";
import { UserArgs, UserFilterArgs } from "../arg/UserArgs";

const BaseUserResolver = createBaseResolver("User", "Users", User, UserArgs, UserFilterArgs);

@Resolver(User)
export class UserResolver extends BaseUserResolver {
}
