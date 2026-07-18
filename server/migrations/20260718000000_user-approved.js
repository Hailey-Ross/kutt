async function up(knex) {
  const hasApproved = await knex.schema.hasColumn("users", "approved");
  if (!hasApproved) {
    await knex.schema.alterTable("users", table => {
      table
        .boolean("approved")
        .notNullable()
        .defaultTo(true);
    });
  }
}

async function down() {
  return null;
}

module.exports = { up, down };
