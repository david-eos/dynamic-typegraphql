import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import { createConnection, Connection } from "typeorm";
import { buildSchema } from "type-graphql";
import { Context } from "./Context";

const main = async () => {

    let conn: Connection;

    await createConnection().then((connection) => {
        conn = connection;
    }).catch((error) => {
        console.error(error);
        process.exit();
    });

    await buildSchema({
        resolvers: [__dirname + "/resolver/**/*.ts"],
        emitSchemaFile: {
            path: __dirname + "/../schema.graphql",
            commentDescriptions: true,
        },
        validate: false,
    }).then((schema) => {

        const apolloServer = new ApolloServer({
            schema,
            context: ({ req }) => {

                const ctx: Context = {
                    req,
                    conn,
                };

                return ctx;
            },
            // tracing: true,
        });

        const app = Express();
        apolloServer.applyMiddleware({ app });

        app.listen(4000, () => {
            console.log("Dynamic-TypeGraphQL running in http://localhost:4000/graphql");
        });
    }).catch((error) => {
        console.log(error);
    });
};

main();
