// 3rd Party Moudles
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const figlet = require('figlet');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Main Route
const mountRoutes = require('./routes/main.routes');

// Utils
const ApiError = require('./utils/apiError.util');
const globalError = require('./middleware/error.middleware');
dotenv.config();

// Express app
const app = express();

// Cors Middleware
app.use(cors());
app.options('*', cors());

// Compression Middleware
app.use(compression());

// Database connection
require('./config/db')();

// Body Parser Middleware => limit the body size to 20kb
app.use(express.json({ limit: '20kb' }));

// Morgan Middleware => Logging
if (process.env.NODE_ENV === 'Development') {
  app.use(morgan('dev'));
}

// Data Sanitization against NoSQL Query Injection Middleware
app.use(mongoSanitize());

// Rate Limiting Middleware
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/', limiter);

// Routes
mountRoutes(app);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// 404 Error Handling Middleware
app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server`, 400));
});

// Global Error Handling Middleware
app.use(globalError);

// Server Connection
const startServer = () => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    figlet('Server Running!', (err, data) => {
      if (err) {
        console.log('Error generating ASCII art.'.red.bold);
        console.dir(err);
        return;
      }
      console.log(data.cyan); // ASCII art in cyan
      console.log(
        `Environment: ${process.env.NODE_ENV || 'development'}`.magenta.bold,
      );
      console.log(`Listening at: http://localhost:${port}`.yellow.bold);
    });
  });
};
startServer();

// Events => Event Loop => Callback Queue => Event Loop => Event Handler
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  process.exit(1);
});
