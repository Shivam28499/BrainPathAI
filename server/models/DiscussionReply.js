const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DiscussionReply = sequelize.define("DiscussionReply", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = DiscussionReply;
