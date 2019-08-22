import { Resolver } from "type-graphql";
import { Page } from "../entity/Page";
import { createBaseResolver } from "./BaseResolver";
import { PageArgs, PageFilterArgs } from "../arg/PageArgs";

const BasePageResolver = createBaseResolver("Page", "Pages", Page, PageArgs, PageFilterArgs);

@Resolver(Page)
export class PageResolver extends BasePageResolver {
}
