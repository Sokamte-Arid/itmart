const ApiError = require('../utils/ApiError');

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Centralized error handler — every thrown/forwarded error ends up here
const errorHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;

  // Prisma known error codes -> friendlier messages
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists.`;
  }
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found.';
  }

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Internal server error.';

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  } else if (statusCode >= 500) {
    // Online: keep the technical details in the server log only, and show
    // visitors a plain message (raw errors can reveal how the system works).
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
    message = 'Une erreur est survenue. Veuillez réessayer. / Something went wrong, please try again.';
    details = undefined;
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: details || undefined,
  });
};

module.exports = { notFound, errorHandler };
