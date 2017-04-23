module.exports = {
    "game-server-development": {
        client: "sqlite3",
        connection: {
            filename: "./game-server.sqlite3",
        },
        migrations: {
            directory: "migrations/game-server",
            stub: "migrations/template.ts",
        },
        useNullAsDefault: true,
    },
    "index-server-development": {
        client: "sqlite3",
        connection: {
            filename: "./index-server.sqlite3",
        },
        migrations: {
            directory: "migrations/index-server",
            stub: "migrations/template.ts",
        },
        useNullAsDefault: true,
    },
};
