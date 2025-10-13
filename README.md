# Express.js API Project

A comprehensive Express.js application with authentication, user management, and post management features.

## Features

- 🔐 JWT Authentication
- 👥 User Management
- 📝 Post Management with comments and likes
- 🛡️ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ Input validation
- 📊 Error handling
- 🧪 Testing setup
- 📝 Logging
- 🗄️ MongoDB integration

## Project Structure

```
mo/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   └── postController.js    # Post management
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── errorHandler.js     # Error handling
│   └── validation.js       # Input validation
├── models/
│   ├── User.js             # User model
│   └── Post.js             # Post model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User routes
│   └── posts.js            # Post routes
├── tests/
│   └── auth.test.js        # Authentication tests
├── utils/
│   ├── helpers.js          # Helper functions
│   └── logger.js           # Logging utility
├── logs/                   # Log files
├── server.js               # Main server file
├── package.json            # Dependencies
└── config.env              # Environment variables
```

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp config.env .env
   # Edit .env with your configuration
   ```

4. Start the server:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Posts

- `GET /api/posts` - Get all published posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `PUT /api/posts/:id/like` - Like/Unlike post
- `POST /api/posts/:id/comments` - Add comment

## Testing

Run tests:

```bash
npm test
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Security Features

- JWT Authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Error handling without sensitive data exposure

## License

ISC

# mo-pets
