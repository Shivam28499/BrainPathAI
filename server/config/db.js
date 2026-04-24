const { Sequelize } = require("sequelize");
require("dotenv").config();

const sharedOptions = {
  logging: false,
  pool: { max: 5, min: 0, acquire: 60000, idle: 10000 },
  retry: { max: 3 },
  dialectOptions: {
    connectTimeout: 60000,
    ...(process.env.DB_SSL === "true"
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}),
  },
};

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: process.env.DB_DIALECT || "postgres",
    ...sharedOptions,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: process.env.DB_DIALECT || "postgres",
      ...sharedOptions,
    }
  );
}

const connectDB = async () => {
  try {
    console.log("Connecting to DB:", {
      via: process.env.DATABASE_URL ? "DATABASE_URL" : "individual vars",
      dialect: process.env.DB_DIALECT,
      ssl: process.env.DB_SSL === "true",
    });
    await sequelize.authenticate();
    console.log("Database connected successfully");
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
