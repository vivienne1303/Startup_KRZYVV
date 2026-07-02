const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Internal server error" : err.message,
      details: err.details,
    },
  });
};

module.exports = errorHandler;
