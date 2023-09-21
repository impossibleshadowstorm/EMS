const createError = require("http-errors");
const Employee = require("../models/User.model");
const { authSchema } = require("../utils/validation");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  blacklistToken,
} = require("../utils/jwt_helpers");

module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);

      const doesExist = await Employee.findOne({ email: result.email });

      if (doesExist)
        throw createError.Conflict(`${result.email} is already registered..!`);

      const employee = new Employee(result);

      const savedEmployee = await employee.save();

      const accessToken = await signAccessToken(savedEmployee.id);
      const refreshToken = await signRefreshToken(savedEmployee.id);
      res.send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);

      const employee = await Employee.findOne({ email: result.email });

      if (!employee) throw createError.NotFound("User not Registered..!");

      const isMatch = await employee.isValidPassword(result.password);

      if (!isMatch)
        throw createError.Unauthorized("Username/Password not Valid..!");

      const accessToken = await signAccessToken(employee.id);
      const refreshToken = await signRefreshToken(employee.id);

      res.send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi)
        return next(createError.BadRequest("Invalid Username / Password"));
      next(error);
    }
  },
  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) throw createError.BadRequest();

      const userId = await verifyRefreshToken(refreshToken);
      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);

      res.send({ accessToken: accessToken, refreshToken: refToken });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      const { refreshToken, accessToken } = req.body;
      if (!refreshToken || !accessToken) throw createError.BadRequest();

      const userId = await verifyRefreshToken(refreshToken);

      if (userId) {
        blacklistToken.push(refreshToken);
        blacklistToken.push(accessToken);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
