const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Lesson = sequelize.define("Lesson", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  videoUrl: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Lesson;
