// ──────────────────────────────────────────────────────────
// models/Room.js — Room Sequelize Model
// Owner: SDP_Shrey Choksi
// Phase: 1 (feature/server-db)
// ──────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Room;
