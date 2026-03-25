// ──────────────────────────────────────────────────────────
// config/db.js — Sequelize PostgreSQL Connection
// Owner: SDP_Shrey Choksi
// Phase: 1 (feature/server-db)
// ──────────────────────────────────────────────────────────

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
