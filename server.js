require('colors');
const figlet = require('figlet');

const app = require('./app');
const connectDB = require('./config/db');

const startServer = async () => {
  const port = process.env.PORT || 3000;
  try {
    await connectDB();
  } catch (error) {
    console.error(
      '[Startup Failure] Unable to connect to the database.'.red.bold,
      error,
    );
    process.exit(1);
  }

  app.listen(port, () => {
    figlet('Server Running!', (err, data) => {
      if (err) {
        console.log('Error generating ASCII art.'.red.bold);
        console.dir(err);
        return;
      }
      console.log(data.cyan);
      console.log(
        `Environment: ${process.env.NODE_ENV || 'development'}`.magenta.bold,
      );
      console.log(`Listening at: http://localhost:${port}`.yellow.bold);
    });
  });
};

if (require.main === module) {
  startServer();
}

// Events => Event Loop => Callback Queue => Event Loop => Event Handler
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  process.exit(1);
});
