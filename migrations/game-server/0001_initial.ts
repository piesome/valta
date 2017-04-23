import * as Knex from "knex";

// tslint:disable:no-empty no-trailing-whitespace

exports.up = async (knex: Knex) => {
    await knex.schema.createTable("config", (table) => {
        table.uuid("id").primary();
        table.string("secret");
    });

    await knex.schema.createTable("game", (table) => {
        table.uuid("id").primary();
        table.string("data");
    });
};

exports.down = async (knex: Knex) => {
    await knex.schema.dropTableIfExists("config");
    await knex.schema.dropTableIfExists("game");
};
