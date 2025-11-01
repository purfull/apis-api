const {
  generateApiKey: getApiKey,
  resetApiKey: updateApiKey,
} = require("../services/apiKeys.service");
const { validateOtpToken } = require("../services/otp.service");

const generateApiKey = async (req, res) => {
  try {
    const { otpToken } = req.body;

    const { id: customerId, email } = req.user

    const validation = await validateOtpToken({
      type: "gendrate-apiKey",
      identifier: email,
      token: otpToken,
    });

    if (!validation.success) {
      return res.status(403).json(validation);
    }
    const result = await getApiKey(customerId);

    res.json({ success: true, apiKey: result, message: "this api key will be shown once, save this before closing" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetApiKey = async (req, res) => {
  try {
    const { otpToken } = req.body;
    const { id: customerId, email } = req.user

    const validation = await validateOtpToken({
      type: "reset-apiKey",
      identifier: email,
      token: otpToken,
    });

    if (!validation.success) {
      return res.status(403).json(validation);
    }

    const result = await updateApiKey(customerId);
    res.json({ success: true, apiKey: result, message: "this api key will be shown once, save this before closing" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generateApiKey, resetApiKey };
