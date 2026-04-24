const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnail: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  level: {
    type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
    defaultValue: "beginner",
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
  },
  totalStudents: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Course;
