const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const LearningPath = sequelize.define("LearningPath", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  assessmentData: {
    type: DataTypes.TEXT("long"),
    defaultValue: null,
  },
  recommendedCourses: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  roadmap: {
    type: DataTypes.TEXT("long"),
    defaultValue: null,
  },
});

module.exports = LearningPath;
