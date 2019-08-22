import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class BaseFilterArgs {

    @Field({ nullable: true })
    public orderDescBy?: string;

    @Field({ nullable: true })
    public orderAscBy?: string;
}
