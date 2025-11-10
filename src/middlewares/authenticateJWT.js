const jwt = require('jsonwebtoken');
const { ACCESS_SECRET, REFRESH_SECRET, generateAccessToken } = require('../services/jwt.service');
const Customer = require("../models/customers.model")

const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    const payload = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      phone: decoded.phone,
    };

    return generateAccessToken(payload);
  } catch (err) {
    return null;
  }
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const refreshToken = req.cookies?.refreshToken;

    if (!token && !refreshToken) {
      return res.status(401).json({ message: "Access and refresh tokens missing" });
    }

    const handleUserAuth = async (user) => {
      req.user = user;

      let schemaName = await redisClient.get(`tenant:schema:${user.id}`);

      if (!schemaName) {
        const customer = await Customer.findByPk(user.id, {
          attributes: ['schemaName'],
        });
        if (customer?.schemaName) {
          schemaName = customer.schemaName;
          await redisClient.set(`tenant:schema:${user.id}`, schemaName, { EX: 3600 });
          console.log(`Cached schema for ${user.id}: ${schemaName}`);
        } else {
          console.warn(`No schema found for user ${user.id}`);
        }
      }

      req.tenantSchema = schemaName;
      next();
    };

    if (!token) {
      return jwt.verify(refreshToken, REFRESH_SECRET, async (err, refreshUser) => {
        if (err) return res.status(401).json({ message: "Refresh token invalid or expired" });

        const newAccessToken = generateAccessToken({
          id: refreshUser.id,
          name: refreshUser.name,
          email: refreshUser.email,
          phone: refreshUser.phone,
        });

        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        return handleUserAuth(refreshUser);
      });
    }

    jwt.verify(token, ACCESS_SECRET, async (err, user) => {
      if (!err) {
        return handleUserAuth(user);
      }

      if (err.name === 'TokenExpiredError') {
        if (!refreshToken)
          return res.status(401).json({ message: 'Refresh token missing' });

        jwt.verify(refreshToken, REFRESH_SECRET, async (refreshErr, refreshUser) => {
          if (refreshErr)
            return res.status(401).json({ message: 'Refresh token expired or invalid' });

          const newAccessToken = generateAccessToken({
            id: refreshUser.id,
            name: refreshUser.name,
            email: refreshUser.email,
            phone: refreshUser.phone,
          });

          res.setHeader('Authorization', `Bearer ${newAccessToken}`);
          return handleUserAuth(refreshUser);
        });
      } else {
        return res.status(401).json({ message: 'Invalid access token' });
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Internal authentication error' });
  }
};

// const authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     const refreshToken = req.cookies?.refreshToken;

//     if (!token) {
//       if (!refreshToken) {
//         return res.status(401).json({ message: "Access and refresh tokens missing" });
//       }

//       return jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, refreshUser) => {
//         if (err) {
//           return res.status(401).json({ message: "Refresh token invalid or expired" });
//         }
        
//         const newAccessToken = generateAccessToken({
//           id: refreshUser.id,
//           name: refreshUser.name,
//           email: refreshUser.email,
//           phone: refreshUser.phone,
//         });

//         res.setHeader("Authorization", `Bearer ${newAccessToken}`);
//         req.user = refreshUser;
//         return next();
//       });
//     }

//     jwt.verify(token, ACCESS_SECRET, (err, user) => {
//       if (!err) {
//         req.user = user;
//         return next();
//       }

//       if (err.name === 'TokenExpiredError') {
//         if (!refreshToken) {
//           return res.status(401).json({ message: 'Refresh token missing' });
//         }

//         jwt.verify(refreshToken, REFRESH_SECRET, async (refreshErr, refreshUser) => {
//           if (refreshErr) {
//             return res.status(401).json({ message: 'Refresh token expired or invalid' });
//           }

//           const newAccessToken = generateAccessToken({
//             id: refreshUser.id,
//             name: refreshUser.name,
//             email: refreshUser.email,
//             phone: refreshUser.phone,
//           });

//           res.setHeader('Authorization', `Bearer ${newAccessToken}`);

//           req.user = refreshUser;
//           next();
//         });
//       } else {
//         return res.status(401).json({ message: 'Invalid access token' });
//       }
//     });
//   } catch (error) {
//     console.error('Auth error:', error);
//     res.status(500).json({ message: 'Internal authentication error' });
//   }
// };


module.exports = {authenticateToken, refreshAccessToken};