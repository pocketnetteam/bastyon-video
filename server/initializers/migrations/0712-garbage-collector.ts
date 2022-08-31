import * as Sequelize from 'sequelize'

async function up (utils: {
  transaction: Sequelize.Transaction
  queryInterface: Sequelize.QueryInterface
  sequelize: Sequelize.Sequelize
  db: any
}): Promise<void> {
  const { transaction } = utils

  {
    const query = `CREATE TABLE IF NOT EXISTS "garbageCollector" (
      id uuid NOT NULL,
      progress integer NOT NULL,
      state integer DEFAULT 1 NOT NULL,
      "nbVideos" integer,
      "videosUrls" character varying(255)[],
      error character varying(255),
      "finishedOn" timestamp with time zone,
      "createdAt" timestamp with time zone NOT NULL,
      "updatedAt" timestamp with time zone NOT NULL
    );
    `
    
    await utils.sequelize.query(query, { transaction })
  }
}

function down (options) {
  throw new Error('Not implemented.')
}

export {
  up,
  down
}
