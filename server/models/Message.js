// ──────────────────────────────────────────────────────────
// models/Message.js — Message Sequelize Model
// Owner: SDP_Shrey Choksi
// Phase: 1 (feature/server-db)
// ──────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // userId FK and roomId FK are added via associations in models/index.js
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Message;
