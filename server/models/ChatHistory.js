const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ChatHistory = sequelize.define("ChatHistory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  aiResponse: {
    type: DataTypes.TEXT("long"),
    allowNull: false,
  },
});

module.exports = ChatHistory;
