const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Enrollment = sequelize.define("Enrollment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  completedLessons: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Enrollment;
