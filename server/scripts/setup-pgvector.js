const { Client } = require("pg");
require("dotenv").config();

const run = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Connected to Postgres");

  await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
  console.log("pgvector extension enabled");

  await client.query(`ALTER TABLE "DocumentChunks" ADD COLUMN IF NOT EXISTS embedding_vec VECTOR(384);`);
  console.log("embedding_vec column added");

  await client.end();
};

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});

