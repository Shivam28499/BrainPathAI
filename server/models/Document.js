const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Document = sequelize.define("Document", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  chunkCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("processing", "ready", "failed"),
    defaultValue: "processing",
  },
  errorMessage: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
});

module.exports = Document;
