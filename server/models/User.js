// ──────────────────────────────────────────────────────────
// models/User.js — User Sequelize Model
// Owner: SDP_Shrey Choksi
// Phase: 1 (feature/server-db)
// ──────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  socketId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
