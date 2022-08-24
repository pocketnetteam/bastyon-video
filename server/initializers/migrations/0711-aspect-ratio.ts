import * as Sequelize from 'sequelize'

async function up (utils: {
  transaction: Sequelize.Transaction
  queryInterface: Sequelize.QueryInterface
  sequelize: Sequelize.Sequelize
  db: any
}): Promise<void> {
  const { transaction } = utils

  const data = {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 1
  }

  await utils.queryInterface.addColumn('video', 'aspectRatio', data, { transaction })
}

function down (options) {
  throw new Error('Not implemented.')
}

export {
  up,
  down
}
