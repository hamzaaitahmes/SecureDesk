import multer from 'multer';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route introuvable : ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.isOperational ? error.message : 'Une erreur interne est survenue.';

  if (error instanceof multer.MulterError) {
    statusCode = 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Le fichier dépasse 2 Mo.' : 'Fichier invalide.';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Cette valeur existe déjà.';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Identifiant invalide.';
  }

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) console.error(error);
  res.status(statusCode).json({
    success: false,
    message,
    ...(error.details ? { errors: error.details } : {}),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { debug: error.message } : {}),
  });
}

