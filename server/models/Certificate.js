const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Certificate = sequelize.define("Certificate", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  certificateUrl: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
});

module.exports = Certificate;
