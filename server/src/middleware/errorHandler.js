/**
 * Centralized error handler. Any error passed to next(err) or thrown inside
 * an async controller wrapped with asyncHandler ends up here.
 * Never leaks stack traces or server paths to the client (SRS 8.1).
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: "The requested resource could not be found.",
  });
}

function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(" ") });
  }

  // Mongoose duplicate key error (unique index violation - e.g. duplicate slug/SKU/email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `This ${field} is already in use.`,
    });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Something went wrong. Please try again later." : err.message,
  });
}

module.exports = { notFound, errorHandler };
