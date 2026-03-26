// ──────────────────────────────────────────────────────────
// models/index.js — Model Associations + DB Sync
// Owner: SDP_Shrey Choksi
// Phase: 1 (feature/server-db)
// ──────────────────────────────────────────────────────────

const sequelize = require('../config/db');
const User = require('./User');
const Room = require('./Room');
const Message = require('./Message');
const RoomMember = require('./RoomMember');

// ── Associations (PRD §4.4 + DM Specification Task 1) ─────
User.hasMany(Message, { foreignKey: 'userId', onDelete: 'CASCADE' });
Room.hasMany(Message, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'userId' });
Message.belongsTo(Room, { foreignKey: 'roomId' });

// Many-To-Many for Group Membership
User.belongsToMany(Room, { through: RoomMember, foreignKey: 'userId', onDelete: 'CASCADE' });
Room.belongsToMany(User, { through: RoomMember, foreignKey: 'roomId', onDelete: 'CASCADE' });

// ── Sync ──────────────────────────────────────────────────
const syncDB = async () => {
  await sequelize.authenticate();
  console.log('✅ DB connected successfully');
  await sequelize.sync({ alter: true });
  console.log('✅ Tables synced: Users, Rooms, Messages, RoomMembers');
};

module.exports = { User, Room, Message, RoomMember, syncDB };
