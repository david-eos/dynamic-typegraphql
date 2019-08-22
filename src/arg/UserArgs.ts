import { ArgsType, Field, Int } from "type-graphql";
import { User } from "../entity/User";
import { BaseFilterArgs } from "./BaseFilterArgs";

/**
 * Arg fields needed to identify ONE instance of User
 */
@ArgsType()
export class UserArgs implements Partial<User> {

    @Field(() => Int)
    public userId: number;
}

/**
 * Unnecessary (nullable) arg fields to filter users as you want
 */
@ArgsType()
export class UserFilterArgs extends BaseFilterArgs implements Partial<User> {

    @Field(() => Int, { nullable: true })
    public userId?: number;

    @Field({ nullable: true })
    public firstName: string;

    @Field({ nullable: true })
    public lastName: string;
}
