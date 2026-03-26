const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RoomMember = sequelize.define('RoomMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
}, {
    timestamps: false,
});

module.exports = RoomMember;
