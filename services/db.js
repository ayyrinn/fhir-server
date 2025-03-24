const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || "fhir_user",
  host: process.env.POSTGRES_HOST || "fhir-postgres", // Gunakan 'postgres' jika Anda menjalankan di Docker
  database: process.env.POSTGRES_DB || "fhir_db",
  password: process.env.POSTGRES_PASSWORD || "fhir_pass",
  port: process.env.POSTGRES_PORT || 5432,
});

pool.on("connect", () => {
  console.log("🟢 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("🔴 Connection error", err);
});

module.exports = pool;
