import * as Sequelize from 'sequelize'

async function up (utils: {
  transaction: Sequelize.Transaction
  queryInterface: Sequelize.QueryInterface
  sequelize: Sequelize.Sequelize
  db: any
}): Promise<void> {
  const { transaction } = utils

  const query = `
  CREATE INDEX IF NOT EXISTS actor_follow_actor_id_target_actor_id_state
  ON public."actorFollow" USING btree ("actorId", "targetActorId", "state");
  `
  await utils.sequelize.query(query, { transaction })
}

function down () {
  throw new Error('Not implemented.')
}

export {
  up,
  down
}
