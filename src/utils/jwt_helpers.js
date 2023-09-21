const JWT = require("jsonwebtoken");
const createError = require("http-errors");

const TOKEN_BLACKLIST = [];

module.exports = {
  blacklistToken: TOKEN_BLACKLIST,
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "10m",
        issuer: "ems.com",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          return reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) next(createError.Unauthorized());

    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;

        return next(createError.Unauthorized(message));
      }

      req.payload = payload;
      next();
    });
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "1y",
        issuer: "ems.com",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          return reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject(createError.Unauthorized());

          const userId = payload.aud;

          resolve(userId);
        }
      );
    });
  },
  isTokenBlacklisted: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    // const token = req.headers.authorization; // Assuming token is in the "Authorization" header

    if (TOKEN_BLACKLIST.includes(token)) {
      // Token is blacklisted, reject the request
      return res.status(401).json({ message: "Token is no longer valid" });
    }

    // Token is not blacklisted, continue with the request
    next();
  },
};
