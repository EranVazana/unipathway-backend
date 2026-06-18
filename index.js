const express = require('express');
const loggerMiddleware = require('./middleware/logger');
const authRouter = require('./routes/authRoute');
const usersRouter = require('./routes/usersRoute');
const departmentsRouter = require('./routes/departmentsRoute');
const universitiesRouter = require('./routes/universitiesRoute');
const admissionThresholdsRouter = require('./routes/admissionThresholdsRoute');
const userWatchlistRouter = require('./routes/userWatchlistRoute');
const academicScoresRouter = require('./routes/academicScoresRoute');
const settingsRouter = require('./routes/settingsRoute');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(loggerMiddleware);

// All routes are served under the /api base path
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/universities', universitiesRouter);
app.use('/api/admission-thresholds', admissionThresholdsRouter);
app.use('/api/watchlist', userWatchlistRouter);
app.use('/api/academic-scores', academicScoresRouter);
app.use('/api/settings', settingsRouter);

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
