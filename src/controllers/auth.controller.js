
const { refreshAccessToken } = require("../middlewares/authenticateJWT");

const generateAuthToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;


    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token found' });
    }

    // Important: refreshAccessToken must return a Promise (use async/await)
    const newAccessToken = await refreshAccessToken(refreshToken);

    if (!newAccessToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Optionally set the access token as a cookie (if you use httpOnly cookies)
    // res.cookie('accessToken', newAccessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    // });
    

    return res.status(200).json({ accessToken: newAccessToken.sign, user: newAccessToken.payload });
  } catch (error) {
    console.error("Error generating new access token:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { generateAuthToken };
