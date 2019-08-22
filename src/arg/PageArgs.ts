import { ArgsType, Field, Int } from "type-graphql";
import { Page } from "../entity/Page";
import { BaseFilterArgs } from "./BaseFilterArgs";

/**
 * Arg fields needed to identify ONE instance of Page
 */
@ArgsType()
export class PageArgs implements Partial<Page> {

    @Field(() => Int)
    public pageId: number;
}

/**
 * Unnecessary (nullable) arg fields to filter pages as you want
 */
@ArgsType()
export class PageFilterArgs extends BaseFilterArgs implements Partial<Page> {

    @Field(() => Int, { nullable: true })
    public pageId?: number;

    @Field({ nullable: true })
    public content: string;
}
