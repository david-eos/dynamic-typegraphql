import { GraphQLObjectType } from "graphql";
import { DynamicQueryOptions } from "./DynamicQueryOptions";

/**
 * GraphQLQueryTreeProperties
 */
export class GraphQLQueryTreeProperties<T> {

    public args: { [key: string]: any }; // Query args
    public options: DynamicQueryOptions<T>; // Query options
    public type: GraphQLObjectType<any, any, {[key: string]: any}>; // Entity

    constructor(args: { [key: string]: any }, options: DynamicQueryOptions<T>, type: GraphQLObjectType<any, any, {[key: string]: any}>) {
        this.args = args;
        this.options = options;
        this.type = type;
    }
}
