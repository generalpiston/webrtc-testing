const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  // storage: '/var/data/instachat',
  storage: '/tmp/instachat.db',
});

const Message = sequelize.define('message', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  channel: Sequelize.STRING,
  data: Sequelize.STRING,
  order: Sequelize.INTEGER,
});

sequelize.sync();

module.exports = { Message };
