const { sendOtp, verifyOtp } = require("../services/otp.service.js");
const CustomersModel = require("../models/customers.model.js")
const { Op } = require("sequelize");

const sendUserOtp = async (req, res) => {
  try {
    const { type, identifier, phone } = req.body;

    if (!type || !identifier) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (type === "customer-registration") {
      // Single query for both email and phone
      const existingCustomer = await CustomersModel.findOne({
        where: {
          [Op.or]: [
            { email: identifier },
            { phone: phone }
          ]
        }
      });

      if (existingCustomer) {
        // Figure out what caused the conflict
        const emailExists = existingCustomer.email === identifier;
        const phoneExists = existingCustomer.phone === phone;

        if (emailExists && phoneExists) {
          return res.status(400).json({
            success: false,
            message: "Email and phone already registered"
          });
        } else if (emailExists) {
          return res.status(400).json({
            success: false,
            message: "Email already registered"
          });
        } else if (phoneExists) {
          return res.status(400).json({
            success: false,
            message: "Phone already registered"
          });
        }
      }
    }

    // Generate and send OTP
    const result = await sendOtp({ type, identifier, phone });
    res.status(200).json(result);

  } catch (err) {
    console.error("Error in sendUserOtp:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};



const verifyUserOtp = async (req, res) => {
  try {
    const { type, identifier, otp } = req.body;
    const result = await verifyOtp({ type, identifier, otp });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendUserOtp, verifyUserOtp };
