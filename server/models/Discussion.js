const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Discussion = sequelize.define("Discussion", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Discussion;
