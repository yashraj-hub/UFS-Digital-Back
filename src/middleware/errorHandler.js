export function notFound(req, res) {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(status).json({
    error: isServerError ? "Internal Server Error" : err.message,
    message: isServerError ? "Something went wrong" : err.message,
  });
}
