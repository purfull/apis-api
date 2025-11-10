const { Sequelize, DataTypes, Model } = require('sequelize');
const { sequelize: globalSequelize } = require('./db.js');

const tenantConnections = {};

async function initTenant(orgId) {
  if (tenantConnections[orgId]) return tenantConnections[orgId];

  const dbName = `org_${orgId}`;

  await globalSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

  const tenantSequelize = new Sequelize(
    dbName,
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false,
    }
  );

  class Message extends Model {}

  Message.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      to: { type: DataTypes.STRING, allowNull: false },
      channel: { type: DataTypes.ENUM('sms', 'email'), allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.ENUM('QUEUED', 'SENT', 'FAILED'), allowNull: false },
    },
    {
      sequelize: tenantSequelize,
      tableName: 'messages',
      timestamps: true,
      updatedAt: false,
    }
  );

  await tenantSequelize.sync();

  tenantConnections[orgId] = tenantSequelize;
  return tenantSequelize;
}

function getTenantConnection(orgId) {
  return tenantConnections[orgId];
}

module.exports = {
  initTenant,
  getTenantConnection,
  tenantConnections,
};