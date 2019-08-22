export = {
    type: "mysql",
    host: "127.0.0.1",
    port: "3306",
    username: "root",
    password: "root",
    database: "dynamic_typegraphql",
    synchronize: true,
    logging: true,
    cache: false,
    entities: [
        "src/entity/**/*.ts",
    ],
    migrations: [
        "src/migration/**/*.ts",
    ],
    subscribers: [
        "src/subscriber/**/*.ts",
    ],
    cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber",
    },
};
