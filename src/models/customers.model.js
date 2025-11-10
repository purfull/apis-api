const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const sequelize = require("../config/db");
const fs = require("fs");
const path = require("path");

const Customer = sequelize.define(
  "Customers",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    schemaName: {
      type: DataTypes.STRING,
      allowNull: true,
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
    countryCode: {
      type: DataTypes.STRING,
      defaultValue: "+91",
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
    postalCode: {
      type: DataTypes.STRING,
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
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "Customers",
    timestamps: true,
  }
);

Customer.afterCreate(async (customer) => {
  const schemaName = `tenant_${customer.id.replace(/-/g, '_')}`;
  const uploadDir = path.join(__dirname, `../../uploads/${schemaName}`);
  try {
    console.log("Creating tenant database...");
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${schemaName}\``);
    console.log(`Database created: ${schemaName}`);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`📁 Folder created: ${uploadDir}`);
    }
    await Customer.update({ schemaName }, { where: { id: customer.id } });
  } catch (err) {
    console.error(`Database creation failed for ${customer.id}:`, err);
  }
});


module.exports = Customer;