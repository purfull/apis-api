const ApiKey = require("../models/apiKeys.model");
const crypto = require("crypto");

const verifyApiKey = async (req, res, next) => {
  const rawKey = req.headers["x-api-key"];
  if (!rawKey) return res.status(401).json({ message: "Missing API key" });

  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
  const apiKey = await ApiKey.findOne({ where: { apiKey: hashedKey, isActive: true } });

  if (!apiKey) return res.status(403).json({ message: "Invalid API key" });

  req.customerId = apiKey.userId; 
  next();
};

module.exports = {verifyApiKey};
