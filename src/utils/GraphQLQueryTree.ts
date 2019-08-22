import { getNullableType, GraphQLResolveInfo, FieldNode, GraphQLObjectType, SelectionNode } from "graphql";
import { getArgumentValues } from "graphql/execution/values";
import { GraphQLQueryTreeProperties } from "./GraphQLQueryTreeProperties";
import { DynamicQueryOptions } from "./DynamicQueryOptions";

/**
 * Gets real type from GraphQL type
 * For example: [Installation!]! => Installation
 * @param type type
 */
function getType(type: any): GraphQLObjectType<any, any, {[key: string]: any}> {

    type = getNullableType(type);
    if (type.ofType) {
        type = getType(type.ofType);
    }

    return type;
}

/**
 * Convert selection nodes into field nodes
 * @param selections field selections
 * @param info GraphQLResolveInfo
 */
function selectionsToFields(selections: readonly SelectionNode[], info: GraphQLResolveInfo): FieldNode[] {

    const fields: FieldNode[] = [];

    selections.forEach((sel) => {

        if (sel.kind === "Field") {
            fields.push(sel);
        } else if (sel.kind === "FragmentSpread") {
            const fragment = info.fragments[sel.name.value];
            fields.push.apply(fields, selectionsToFields(fragment.selectionSet.selections, info));
        } else if (sel.kind === "InlineFragment") {
            fields.push.apply(fields, selectionsToFields(sel.selectionSet.selections, info));
        }
    });

    return fields;
}

/**
 * Builds Dynamic Query Options
 * @param queryOptions graph ql options
 */
function buildQueryOptions<T>(queryOptions: { [key: string]: any } = {}): DynamicQueryOptions<T> {

    const options: DynamicQueryOptions<T> = {};
    const order: { [P in keyof T]?: "ASC" | "DESC" | 1 | -1 } = {};

    Object.entries(queryOptions).forEach(([op, value]) => {
        switch (op) {
            case "orderDescBy":
                order[value] = "DESC";
                break;
            case "orderAscBy":
                order[value] = "ASC";
                break;
            default:
                break;
        }
    });

    options.order = order;

    return options;
}

/**
 * This function takes query args and differs between args and options
 * @param type node type
 * @param queryArgs Args of graphql query
 */
function buildQueryProperties<T>(
    type: GraphQLObjectType<any, any, { [key: string]: any }>,
    queryArgs: { [key: string]: any },
): GraphQLQueryTreeProperties<T> {

    const args: { [key: string]: any } = {};
    const queryOptions: { [key: string]: any } = {};

    if (type.getFields && queryArgs) {
        Object.keys(queryArgs).forEach((key) => {
            if (Object.keys(type.getFields()).includes(key)) {
                args[key] = queryArgs[key];
            } else {
                queryOptions[key] = queryArgs[key];
            }
        });
    }

    return new GraphQLQueryTreeProperties(args, buildQueryOptions(queryOptions), type);
}

/**
 * This recursive function builds the entire tree
 * @param parent Parent node
 * @param selections Selections of parent node
 * @param info GraphQLResolveInfo
 */
function buildTree<T>(
    parent: GraphQLQueryTree<T>,
    selections: readonly FieldNode[] | readonly SelectionNode[],
    info: GraphQLResolveInfo,
): void {

    const childFields: Array<GraphQLQueryTree<any>> = []; // Initialize child trees (fields)
    const fieldNodes = selectionsToFields(selections, info); // Transform SelectionNodes to FieldNodes

    // For each field node
    fieldNodes.forEach((field) => {

        const name = field.name.value;
        if (name === "__typename") {
            return;
        }

        const fieldDef = parent.properties.type.getFields()[name];
        const queryArgs = getArgumentValues(fieldDef, field, info.variableValues);
        const type = getType(fieldDef.type);

        const properties = buildQueryProperties(type, queryArgs);
        const child = new GraphQLQueryTree(name, properties);

        childFields.push(child);

        if (field.selectionSet) {
            buildTree(child, field.selectionSet.selections, info);
        }
    });

    parent.setFields(childFields);
}

/**
 * This function takes GraphQLResolveInfo and starts to build the query tree
 * @param info GraphQLResolveInfo
 */
function buildQueryTree<T>(info: GraphQLResolveInfo): GraphQLQueryTree<T> {

    const name = info.fieldName;
    const fieldDef = getType(info.parentType).getFields()[name];
    const queryArgs = getArgumentValues(fieldDef, info.fieldNodes[0], info.variableValues);
    const type = getType(info.returnType);

    const properties = buildQueryProperties(type, queryArgs);
    const root = new GraphQLQueryTree(info.fieldName, properties);

    buildTree<T>(root, info.fieldNodes[0].selectionSet.selections, info);

    return root;
}

/**
 * GraphQLQueryTree
 * Represents GraphQL query with a tree, each node with its arguments and options.
 * Each node is related to its fields (childs)
 * If a field does not have childs, then it is a simple field (Int, String)
 */
export class GraphQLQueryTree<T> {

    public name: string; // Name of field
    public properties: GraphQLQueryTreeProperties<T>; // Field properties
    public fields: Array<GraphQLQueryTree<any>>; // Child fields

    constructor(name: string, properties: GraphQLQueryTreeProperties<T> = null, fields: Array<GraphQLQueryTree<any>> = []) {
        this.name = name;
        this.properties = properties;
        this.fields = fields;
    }

    /**
     * Creates the tree
     * @param info GraphQLResolveInfo
     */
    public static createTree<X>(info: GraphQLResolveInfo): GraphQLQueryTree<X> {
        return buildQueryTree<X>(info);
    }

    /**
     * Sets the node child trees
     * @param fields childFields
     */
    public setFields(fields: Array<GraphQLQueryTree<any>>): void {
        this.fields = fields;
    }

    /**
     * Sets de node properties
     * @param properties field properties
     */
    public setProperties(properties: GraphQLQueryTreeProperties<T>): void {
        this.properties = properties;
    }

    /**
     * Returns a child field
     * @param name fieldName
     */
    public getField(name: string) {
        return this.fields.find((field) => field.name === name);
    }

    /**
     * Check if this field is a relation
     */
    public isRelation(): boolean {
        if (this.fields && this.fields.length) {
            return true;
        }

        return false;
    }

    /**
     * Transforms the entire tree recursively into a printable object
     */
    public toObject(): { [key: string]: any } {
        const obj = {};

        obj["__args"] = this.properties.args;
        obj["__options"] = this.properties.options;
        obj["__type"] = this.properties.type.name;

        this.fields.forEach((field) => {
            obj[field.name] = field.toObject();
        });

        return obj;
    }
}
