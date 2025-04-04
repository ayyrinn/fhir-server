const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  // user: process.env.POSTGRES_USER || "fhir_user",
  host: "fhir-postgres",
  port: 5432,
  user: process.env.POSTGRES_USER || "fhir_user",
  password: process.env.POSTGRES_PASSWORD || "fhir_pass",
  database: process.env.POSTGRES_DB || "fhir_db",
});

pool.on("connect", () => {
  console.log("🟢 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("🔴 Connection error", err);
});

module.exports = pool;
