const crypto = require("crypto");
const ApiKey = require("../models/apiKeys.model");

const generateApiKey = async (customerId) => {
  try {
    const rawKey = crypto.randomBytes(32).toString("hex");
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

    await ApiKey.create({
      customerId,
      apiKey: hashedKey,
      credits: 1000,
      status: "active",
    });
    return rawKey;

  } catch (err) {
    console.error("Error generating API key:", err);
    throw new Error("API key generation failed");
  }
};


const resetApiKey = async (customerId) => {
  try {
    await ApiKey.update({ status: "inactive" }, { where: { customerId } });

    const newKey = await generateApiKey(customerId);

    return newKey;
  } catch (error) {
    console.error("Error resetting API key:", error);
    throw new Error("Failed to reset API key");
  }
};


module.exports = { generateApiKey, resetApiKey };
