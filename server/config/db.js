const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
    dialectOptions:
      process.env.DB_SSL === "true"
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
  }
);

const connectDB = async () => {
  try {
    console.log("Connecting to DB:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      dialect: process.env.DB_DIALECT,
      hasPassword: Boolean(process.env.DB_PASSWORD),
    });
    await sequelize.authenticate();
    console.log("MySQL connected successfully");
  } catch (error) {
    console.error("Database connection failed");
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error code:", error?.original?.code || error?.parent?.code);
    console.error("Full error:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
