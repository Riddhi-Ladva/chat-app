// ──────────────────────────────────────────────────────────
// models/index.js — Model Associations + DB Sync
// Owner: SDP_Shrey Choksi
// Phase: 1 (feature/server-db)
// ──────────────────────────────────────────────────────────

const sequelize = require('../config/db');
const User = require('./User');
const Room = require('./Room');
const Message = require('./Message');

// ── Associations (PRD §4.4) ───────────────────────────────
User.hasMany(Message,   { foreignKey: 'userId' });
Room.hasMany(Message,   { foreignKey: 'roomId' });
Message.belongsTo(User, { foreignKey: 'userId' });
Message.belongsTo(Room, { foreignKey: 'roomId' });

// Enhanced Many-to-Many logic for PM requirements
User.belongsToMany(Room, { through: 'UserRooms' });
Room.belongsToMany(User, { through: 'UserRooms' });

// ── Sync ──────────────────────────────────────────────────
// alter:true updates existing tables without dropping data (safe for dev)
const syncDB = async () => {
  await sequelize.authenticate();
  console.log('✅ DB connected successfully');
  await sequelize.sync({ alter: true });
  console.log('✅ Tables synced: Users, Rooms, Messages');
};

module.exports = { User, Room, Message, syncDB };
