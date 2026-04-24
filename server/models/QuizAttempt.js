const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const QuizAttempt = sequelize.define("QuizAttempt", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  answers: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  aiFeedback: {
    type: DataTypes.TEXT("long"),
    defaultValue: null,
  },
});

module.exports = QuizAttempt;
