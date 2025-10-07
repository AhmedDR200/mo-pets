const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const mountRoutes = require('./routes/main.routes');
const ApiError = require('./utils/apiError.util');
const globalError = require('./middleware/error.middleware');

dotenv.config();

const app = express();

app.use(cors());
app.options('*', cors());

app.use(compression());

app.use(express.json({ limit: '20kb' }));

if (process.env.NODE_ENV === 'Development') {
  app.use(morgan('dev'));
}

app.use(mongoSanitize());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/', limiter);

mountRoutes(app);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server`, 400));
});

app.use(globalError);

module.exports = app;
