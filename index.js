const express = require('express');
const loggerMiddleware = require('./middleware/logger');
const usersRouter = require('./routes/usersRoute');
const departmentsRouter = require('./routes/departmentsRoute');
const universitiesRouter = require('./routes/universitiesRoute');
const admissionThresholdsRouter = require('./routes/admissionThresholdsRoute');
const userWatchlistRouter = require('./routes/userWatchlistRoute');
const academicScoresRouter = require('./routes/academicScoresRoute');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(loggerMiddleware);

app.use('/users', usersRouter);
app.use('/departments', departmentsRouter);
app.use('/universities', universitiesRouter);
app.use('/admission-thresholds', admissionThresholdsRouter);
app.use('/watchlist', userWatchlistRouter);
app.use('/academic-scores', academicScoresRouter);

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
