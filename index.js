const express = require('express');
const loggerMiddleware = require('./middleware/logger');
const usersRouter = require('./routes/usersRoute');
const departmentsRouter = require('./routes/departmentsRoute');
const universitiesRouter = require('./routes/universitiesRoute');
const admissionThresholdsRouter = require('./routes/admissionThresholdsRoute');
const userWatchlistRouter = require('./routes/userWatchlistRoute');

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// Global logger middleware
app.use(loggerMiddleware);

// Routes
app.use('/users', usersRouter);
app.use('/departments', departmentsRouter);
app.use('/universities', universitiesRouter);
app.use('/admission-thresholds', admissionThresholdsRouter);
app.use('/watchlist', userWatchlistRouter);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found.`,
      details: {}
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
      details: {}
    }
  });
});

app.listen(PORT, () => {
  console.log(`UniPathway API running on http://localhost:${PORT}`);
});