const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

module.exports = sequelize.define('Customers', {
  id: {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
  },
  city: {
    type: DataTypes.TEXT,
  },
  state: {
    type: DataTypes.TEXT,
  },
  country: {
    type: DataTypes.TEXT,
  },
  postalCode: {
    type: DataTypes.STRING,
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
  tableName: 'Customers',
  timestamps: true,
});


