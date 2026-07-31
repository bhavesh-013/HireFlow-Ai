const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Middleware to check validation results from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
  }));

  throw ApiError.badRequest('Validation Failed', extractedErrors);
};

module.exports = validate;
