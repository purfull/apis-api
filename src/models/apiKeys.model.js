const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

module.exports = sequelize.define('Api_Keys', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: "active",
  },

}, {
  tableName: 'Api_Keys',
  timestamps: true,
});


