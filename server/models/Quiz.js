const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Quiz = sequelize.define("Quiz", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  questions: {
    type: DataTypes.TEXT("long"),
    allowNull: false,
  },
  isAiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Quiz;
