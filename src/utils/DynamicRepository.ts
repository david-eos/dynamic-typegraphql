import { GraphQLQueryTree } from "./GraphQLQueryTree";
import { SelectQueryBuilder, EntityMetadata, Connection, ObjectType, EntitySchema } from "typeorm";
import { RelationMetadata } from "typeorm/metadata/RelationMetadata";

/**
 * Builds TypeORM query with the query builder recursively,
 * joining every requested relation,
 * selection every asked attribute,
 * adding query options.
 * @param tree GraphQLQueryTree
 * @param qb SelectQueryBuilder
 * @param alias Entity alias
 * @param metadata Entity metadata
 */
function buildQueryRecursively<T>(tree: GraphQLQueryTree<T>, qb: SelectQueryBuilder<T>, alias: string, metadata: EntityMetadata) {

    // Firstly, we list all selected fields at this level of the query tree
    const selectedFields = tree.fields.filter((field) => !field.isRelation()).map((field) => alias + "." + field.name);

    // Secondly, we list all fields used in arguments
    const argFields = Object.keys(tree.properties.args).map((arg) => alias + "." + arg);

    // We select all of above
    qb.addSelect(argFields);
    qb.addSelect(selectedFields);

    // We add order options
    Object.keys(tree.properties.options.order).forEach((key: string) => {
        qb.addOrderBy(alias + "." + key, tree.properties.options.order[key]);
    });

    // We add args filters
    Object.keys(tree.properties.args).forEach((key: string) => {
        qb.andWhere(alias + "." + key + " = :" + key, { [`${key}`]: tree.properties.args[key] });
    });

    // For each asked relation
    tree.fields.filter((field) => field.isRelation()).forEach((relationTree) => {

        const relation: RelationMetadata = metadata.findRelationWithPropertyPath(relationTree.name);

        // If the relation query tree is asking for exists, we join it recursively
        if (relation) {

            const relationAlias = qb.connection.namingStrategy.eagerJoinRelationAlias(alias, relation.propertyPath);

            qb.leftJoinAndSelect(alias + "." + relation.propertyPath, relationAlias);
            buildQueryRecursively(relationTree, qb, relationAlias, relation.inverseEntityMetadata);
        }

    });

    // OLD WAY TO DO THE SAME
    // // For each relation of entity
    // metadata.relations.forEach((relation) => {
    //     const relationTree: GraphQLQueryTree<T> = tree.getField(relation.propertyName);

    //     // If the query tree ask for this relation, we join it recursively
    //     if (relationTree) {
    //         const relationAlias = qb.connection.namingStrategy.eagerJoinRelationAlias(alias, relation.propertyPath);

    //         qb.leftJoinAndSelect(alias + "." + relation.propertyPath, relationAlias);
    //         buildQueryRecursively(relationTree, qb, relationAlias, relation.inverseEntityMetadata);
    //     }
    // });
}

/**
 * EMPRO REPOSITORY
 * This class helps to resolve any GraphQL query based on the query tree constructed using GraphQLResolveInfo.
 * It can find any type of entity, join every requested relation and select asked attributes.
 */
export class DynamicRepository {

    /**
     * Generates TypeORM query builder based on GraphQLQueryTree args, relations & options
     * @param conn TypeORM connection
     * @param tree GraphQLQueryTree
     * @param entityClass Entity
     */
    private static generateQueryBuilder<T>(conn: Connection, tree: GraphQLQueryTree<T>, entityClass: ObjectType<T> | EntitySchema<T> | string): SelectQueryBuilder<T> {
        const metadata = conn.getMetadata(entityClass);
        const qb = conn.createQueryBuilder<T>(entityClass, metadata.name);

        qb.select([]); // Clear any selected attributes in the query builder
        buildQueryRecursively<T>(tree, qb, qb.alias, metadata);

        return qb;
    }

    /**
     * Finds multiple instances of entity
     * @param conn TypeORM connection
     * @param tree GraphQLQueryTree
     * @param entityClass Entity
     */
    public static async find<T>(conn: Connection, tree: GraphQLQueryTree<T>, entityClass: ObjectType<T> | EntitySchema<T> | string): Promise<T[]> {
        return this.generateQueryBuilder<T>(conn, tree, entityClass).getMany();
    }

    /**
     * Finds one instance of entity
     * @param conn TypeORM connection
     * @param tree GraphQLQueryTree
     * @param entityClass Entity
     */
    public static async findOne<T>(conn: Connection, tree: GraphQLQueryTree<T>, entityClass: ObjectType<T> | EntitySchema<T> | string): Promise<T> {
        return this.generateQueryBuilder<T>(conn, tree, entityClass).getOne();
    }
}
