const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DocumentChunk = sequelize.define("DocumentChunk", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chunkIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT("long"),
    allowNull: false,
  },
  embedding: {
    type: DataTypes.TEXT("long"),
    allowNull: false,
  },
  pageNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
});

module.exports = DocumentChunk;
