import * as Knex from "knex";

// tslint:disable:no-empty no-trailing-whitespace

exports.up = async (knex: Knex) => {
    await knex.schema.createTable("client", (table) => {
        table.uuid("id").primary();
        table.string("secret_hash");
    });

    await knex.schema.createTable("game_server", (table) => {
        table.uuid("id").primary();
        table.string("secret");
    });
};

exports.down = async (knex: Knex) => {
    await knex.schema.dropTableIfExists("client");
    await knex.schema.dropTableIfExists("game_server");
};
