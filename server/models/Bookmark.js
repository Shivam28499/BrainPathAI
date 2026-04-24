const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Bookmark = sequelize.define("Bookmark", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

module.exports = Bookmark;
