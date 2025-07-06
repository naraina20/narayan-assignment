const sequelize = require('../config/db');
const User = require('./user.model');
const Token = require('./token.model');

// Setup relationships (if needed in future)
User.hasMany(Token, { foreignKey: 'userId' });
Token.belongsTo(User, { foreignKey: 'userId' });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // or { force: true } to reset
    console.log('All models synced to the database.');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
};

module.exports = {
  sequelize,
  User,
  Token,
  syncDatabase
};
