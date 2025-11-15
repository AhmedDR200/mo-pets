# Mo Pets API Documentation

Base URL: `https://mo-pets.vercel.app` or `http://localhost:3000` (development)

## Table of Contents

- [Introduction](#introduction)
- [Project Setup](#project-setup)
- [Authentication](#authentication)
- [Health Check](#health-check)
- [Categories](#categories)
- [SubCategories](#subcategories)
- [Products](#products)
- [Offers](#offers)
- [Sliders](#sliders)
- [Search](#search)
- [Error Handling](#error-handling)
- [Data Models](#data-models)
- [Model Relationships](#model-relationships)
- [Utilities](#utilities)
- [Environment Variables](#environment-variables)

---

## Introduction

This API provides endpoints for managing a pet store application. It includes functionality for managing categories, subcategories, products, special offers, and promotional sliders.

### Key Features

- RESTful API design
- MongoDB database with Mongoose ODM
- Express.js framework
- Cloudinary integration for image storage
- Automated offer expiration handling (hourly scheduler)
- Wholesale access control with JWT authentication
- Rate limiting and security features
- Swagger documentation
- Email notifications for wholesale access requests

---

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Cloudinary account (for image uploads)
- Email service (SMTP) for wholesale access notifications

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=Development
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   WHOLESALE_JWT_SECRET=your_jwt_secret_key
   WHOLESALE_JWT_EXPIRES_IN=2h
   EMAIL_HOST=your_smtp_host
   EMAIL_PORT=465
   EMAIL_USER=your_email_user
   EMAIL_PASSWORD=your_email_password
   ADMIN_EMAIL=admin@example.com
   ```
4. Start the server:
   ```
   npm start
   ```
   Or for development with auto-reload:
   ```
   npm run dev
   ```

### Project Structure

- `config/` - Configuration files (database, cloudinary)
- `controllers/` - Route controllers
- `middleware/` - Express middleware (error handling, validation, wholesale access)
- `models/` - Mongoose models
- `routes/` - API routes
- `utils/` - Utility functions (API errors, cloudinary, email, offer scheduler)
- `server.js` - Main application entry point

---

## Authentication

### Wholesale Access

The API implements a wholesale access system that allows authorized users to view wholesale prices for products. Access is controlled through JWT tokens.

#### Request Wholesale Access

**Endpoint:** `POST /api/access/wholesale/request`

**Description:** Request wholesale access by providing an email address. An OTP (One-Time Password) will be sent to the admin email.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Email address requesting wholesale access |

**Example Request:**
```json
{
  "email": "customer@example.com"
}
```

**Response:** (202 Accepted)
```json
{
  "status": "success",
  "message": "Wholesale access request submitted. An administrator will share the passcode with you."
}
```

**Note:** An OTP code is generated and sent to the admin email. The admin must share this OTP with the requester. The OTP expires in 2 hours.

---

#### Verify Wholesale OTP

**Endpoint:** `POST /api/access/wholesale/verify`

**Description:** Verify the OTP code to receive a JWT token for wholesale access.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Email address used in the request |
| `otp` | string | Yes | OTP code received from admin |

**Example Request:**
```json
{
  "email": "customer@example.com",
  "otp": "123456"
}
```

**Response:** (200 OK)
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-08T14:00:00.000Z"
}
```

**Note:** The token expires in 2 hours (configurable via `WHOLESALE_JWT_EXPIRES_IN`). Use this token in the `Authorization` header for subsequent requests.

---

#### Using Wholesale Access Token

To access wholesale prices, include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

**Endpoints that support wholesale access:**
- `GET /api/products` - Shows wholesale prices
- `GET /api/products/:id` - Shows wholesale prices
- `GET /api/offers` - Shows wholesale prices in products
- `GET /api/offers/:id` - Shows wholesale prices in products
- `GET /api/categories/:id` - Shows wholesale prices in products
- `GET /api/search` - Shows wholesale prices in search results

**Note:** Without a valid token, wholesale prices are automatically excluded from responses.

---

## Health Check

### Get Server Health

**Endpoint:** `GET /api/health`

**Description:** Check if the server is running and verify database connection status

**Response:**
```json
{
  "status": "success",
  "message": "Server and database are healthy.",
  "timestamp": "2025-10-08T12:00:00.000Z",
  "uptimeSeconds": 3600.50,
  "db": {
    "state": "connected",
    "healthy": true,
    "latencyMs": 5.23,
    "error": null
  }
}
```

**Error Response:** (503 Service Unavailable)
```json
{
  "status": "error",
  "message": "Server is running but database check failed.",
  "timestamp": "2025-10-08T12:00:00.000Z",
  "uptimeSeconds": 3600.50,
  "db": {
    "state": "disconnected",
    "healthy": false,
    "latencyMs": null,
    "error": "Database is disconnected"
  }
}
```

---

## Categories

### Get All Categories

**Endpoint:** `GET /api/categories`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of items per page |
| `sort` | string | `-createdAt` | Sort field (prefix with `-` for descending) |

**Example Request:**
```
GET /api/categories?page=1&limit=10&sort=-createdAt
```

**Response:**
```json
{
  "status": "success",
  "results": 10,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  },
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4b5a",
      "name": "Dogs",
      "description": "Products for dogs",
      "image": "https://example.com/dogs.jpg",
      "products": [],
      "subCategories": [],
      "createdAt": "2025-10-08T12:00:00.000Z",
      "updatedAt": "2025-10-08T12:00:00.000Z"
    }
  ]
}
```

---

### Get Single Category

**Endpoint:** `GET /api/categories/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Category ID (MongoDB ObjectId) |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for products pagination |
| `limit` | number | 10 | Number of products per page |
| `sort` | string | `-createdAt` | Sort field for products |

**Authentication:** Optional - Include `Authorization: Bearer <token>` header to view wholesale prices

**Example Request:**
```
GET /api/categories/60d5ec49f1b2c72b8c8e4b5a?page=1&limit=10
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b5a",
    "name": "Dogs",
    "description": "Products for dogs",
    "image": "https://example.com/dogs.jpg",
    "subCategories": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4b6b",
        "name": "Food",
        "description": "Dog food products",
        "image": "https://example.com/dog-food.jpg",
        "category": "60d5ec49f1b2c72b8c8e4b5a",
        "products": [],
        "createdAt": "2025-10-08T12:00:00.000Z",
        "updatedAt": "2025-10-08T12:00:00.000Z"
      }
    ],
    "products": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4b7c",
        "name": "Premium Dog Food",
        "retailPrice": 29.99,
        "description": "High-quality dog food",
        "stock": 100,
        "image": "https://example.com/dog-food.jpg",
        "createdAt": "2025-10-08T12:00:00.000Z",
        "updatedAt": "2025-10-08T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    },
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  }
}
```

**Note:** 
- Products are paginated in the response
- Category and subCategory fields are excluded from product objects
- Wholesale prices are included only if a valid wholesale access token is provided

---

### Create Category

**Endpoint:** `POST /api/categories`

**Content-Type:** `multipart/form-data` or `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Category name (must be unique) |
| `description` | string | Yes | Category description |
| `image` | string/file | No | Category image URL or file upload |

**Example Request (JSON):**
```json
{
  "name": "Dogs",
  "description": "Products for dogs",
  "image": "https://example.com/dogs.jpg"
}
```

**Example Request (Form Data):**
```
name: Dogs
description: Products for dogs
image: <file>
```

**Response:** (201 Created)
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b5a",
    "name": "Dogs",
    "description": "Products for dogs",
    "image": "https://res.cloudinary.com/example/image/upload/v1234567890/dogs.jpg",
    "products": [],
    "subCategories": [],
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  }
}
```

---

### Update Category

**Endpoint:** `PATCH /api/categories/:id`

**Content-Type:** `multipart/form-data` or `application/json`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Category ID (MongoDB ObjectId) |

**Request Body:** (All fields optional)
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Category name (must be unique) |
| `description` | string | Category description |
| `image` | string/file | Category image URL or file upload |

**Example Request:**
```json
{
  "name": "Cats",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b5a",
    "name": "Cats",
    "description": "Updated description",
    "image": "https://example.com/dogs.jpg",
    "products": [],
    "subCategories": [],
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:30:00.000Z"
  }
}
```

---

### Delete Category

**Endpoint:** `DELETE /api/categories/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Category ID (MongoDB ObjectId) |

**Note:** Deleting a category will also delete all associated subcategories and products. This operation maintains referential integrity by removing all related data.

**Response:** (200 OK)
```json
{
  "status": "success",
  "message": "Category deleted"
}
```

---

## SubCategories

### Get All SubCategories

**Endpoint:** `GET /api/subcategories`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of items per page |
| `sort` | string | `-createdAt` | Sort field (prefix with `-` for descending) |
| `category` | string | - | Filter by category ID |

**Example Request:**
```
GET /api/subcategories?page=1&limit=10&category=60d5ec49f1b2c72b8c8e4b5a
```

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  },
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4b6b",
      "name": "Food",
      "description": "Dog food products",
      "image": "https://example.com/dog-food.jpg",
      "category": {
        "_id": "60d5ec49f1b2c72b8c8e4b5a",
        "name": "Dogs"
      },
      "products": [],
      "createdAt": "2025-10-08T12:00:00.000Z",
      "updatedAt": "2025-10-08T12:00:00.000Z"
    }
  ]
}
```

---

### Get Single SubCategory

**Endpoint:** `GET /api/subcategories/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | SubCategory ID (MongoDB ObjectId) |

**Example Request:**
```
GET /api/subcategories/60d5ec49f1b2c72b8c8e4b6b
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b6b",
    "name": "Food",
    "description": "Dog food products",
    "image": "https://example.com/dog-food.jpg",
    "category": {
      "_id": "60d5ec49f1b2c72b8c8e4b5a",
      "name": "Dogs"
    },
    "products": [],
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  }
}
```

---

### Create SubCategory

**Endpoint:** `POST /api/subcategories`

**Content-Type:** `multipart/form-data` or `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | SubCategory name (must be unique within category) |
| `description` | string | Yes | SubCategory description |
| `category` | string | Yes | Parent category ID (MongoDB ObjectId) |
| `image` | string/file | No | SubCategory image URL or file upload |

**Example Request:**
```json
{
  "name": "Food",
  "description": "Dog food products",
  "category": "60d5ec49f1b2c72b8c8e4b5a",
  "image": "https://example.com/dog-food.jpg"
}
```

**Response:** (201 Created)
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b6b",
    "name": "Food",
    "description": "Dog food products",
    "image": "https://example.com/dog-food.jpg",
    "category": "60d5ec49f1b2c72b8c8e4b5a",
    "products": [],
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  }
}
```

**Note:** Creating a subcategory automatically adds it to the parent category's `subCategories` array.

---

### Update SubCategory

**Endpoint:** `PATCH /api/subcategories/:id`

**Content-Type:** `multipart/form-data` or `application/json`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | SubCategory ID (MongoDB ObjectId) |

**Request Body:** (All fields optional)
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | SubCategory name (must be unique within category) |
| `description` | string | SubCategory description |
| `category` | string | Parent category ID (MongoDB ObjectId) |
| `image` | string/file | SubCategory image URL or file upload |

**Note:** 
- Changing the category will also move all associated products to the new category
- Category and SubCategory arrays are automatically maintained

**Example Request:**
```json
{
  "name": "Premium Food",
  "description": "Premium dog food products"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b6b",
    "name": "Premium Food",
    "description": "Premium dog food products",
    "image": "https://example.com/dog-food.jpg",
    "category": "60d5ec49f1b2c72b8c8e4b5a",
    "products": [],
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:30:00.000Z"
  }
}
```

---

### Delete SubCategory

**Endpoint:** `DELETE /api/subcategories/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | SubCategory ID (MongoDB ObjectId) |

**Note:** 
- Deleting a subcategory will also delete all associated products
- The subcategory is automatically removed from the parent category's `subCategories` array
- All products are automatically removed from the parent category's `products` array

**Response:** (200 OK)
```json
{
  "status": "success",
  "message": "SubCategory deleted"
}
```

---

## Products

### Get All Products

**Endpoint:** `GET /api/products`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of items per page |
| `sort` | string | `-createdAt` | Sort field (prefix with `-` for descending) |
| `category` | string | - | Filter by category ID |
| `subCategory` | string | - | Filter by subcategory ID |
| `name` | string | - | Search products by name (case-insensitive) |

**Authentication:** Optional - Include `Authorization: Bearer <token>` header to view wholesale prices

**Example Request:**
```
GET /api/products?page=1&limit=10&category=60d5ec49f1b2c72b8c8e4b5a&name=dog
```

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  },
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4b7c",
      "name": "Premium Dog Food",
      "wholesalePrice": 24.99,
      "retailPrice": 29.99,
      "originalRetailPrice": 39.99,
      "discountedRetailPrice": 29.99,
      "hasActiveOffer": true,
      "activeOfferId": "60d5ec49f1b2c72b8c8e4b8d",
      "description": "High-quality dog food",
      "stock": 100,
      "image": "https://example.com/dog-food.jpg",
      "category": {
        "_id": "60d5ec49f1b2c72b8c8e4b5a",
        "name": "Dogs"
      },
      "subCategory": {
        "_id": "60d5ec49f1b2c72b8c8e4b6b",
        "name": "Food"
      },
      "createdAt": "2025-10-08T12:00:00.000Z",
      "updatedAt": "2025-10-08T12:00:00.000Z"
    }
  ]
}
```

**Note:** 
- `wholesalePrice` is only included if a valid wholesale access token is provided
- `originalRetailPrice` and `discountedRetailPrice` are included only if the product has an active offer
- `hasActiveOffer` and `activeOfferId` indicate if the product is part of an active offer

---

### Get Single Product

**Endpoint:** `GET /api/products/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID (MongoDB ObjectId) |

**Authentication:** Optional - Include `Authorization: Bearer <token>` header to view wholesale prices

**Example Request:**
```
GET /api/products/60d5ec49f1b2c72b8c8e4b7c
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b7c",
    "name": "Premium Dog Food",
    "wholesalePrice": 24.99,
    "retailPrice": 29.99,
    "originalRetailPrice": 39.99,
    "discountedRetailPrice": 29.99,
    "hasActiveOffer": true,
    "activeOfferId": "60d5ec49f1b2c72b8c8e4b8d",
    "description": "High-quality dog food",
    "stock": 100,
    "image": "https://example.com/dog-food.jpg",
    "category": {
      "_id": "60d5ec49f1b2c72b8c8e4b5a",
      "name": "Dogs"
    },
    "subCategory": {
      "_id": "60d5ec49f1b2c72b8c8e4b6b",
      "name": "Food"
    },
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  }
}
```

---

### Create Product

**Endpoint:** `POST /api/products`

**Content-Type:** `multipart/form-data` or `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Product name (must be unique within category and subCategory) |
| `wholesalePrice` | number | Yes | Product wholesale price (must be less than retailPrice) |
| `retailPrice` | number | Yes | Product retail price (must be greater than wholesalePrice) |
| `description` | string | No | Product description |
| `stock` | number | Yes | Product stock quantity (min: 0) |
| `image` | string/file | No | Product image URL or file upload |
| `category` | string | Yes | Category ID (MongoDB ObjectId) |
| `subCategory` | string | Yes | SubCategory ID (MongoDB ObjectId) |

**Validation Rules:**
- `retailPrice` must be greater than `wholesalePrice`
- `subCategory` must belong to the specified `category`
- Product name must be unique within the category and subCategory combination

**Example Request:**
```json
{
  "name": "Premium Dog Food",
  "wholesalePrice": 24.99,
  "retailPrice": 39.99,
  "description": "High-quality dog food",
  "stock": 100,
  "image": "https://example.com/dog-food.jpg",
  "category": "60d5ec49f1b2c72b8c8e4b5a",
  "subCategory": "60d5ec49f1b2c72b8c8e4b6b"
}
```

**Response:** (201 Created)
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b7c",
    "name": "Premium Dog Food",
    "wholesalePrice": 24.99,
    "retailPrice": 39.99,
    "originalRetailPrice": 39.99,
    "hasActiveOffer": false,
    "activeOfferId": null,
    "description": "High-quality dog food",
    "stock": 100,
    "image": "https://example.com/dog-food.jpg",
    "category": "60d5ec49f1b2c72b8c8e4b5a",
    "subCategory": "60d5ec49f1b2c72b8c8e4b6b",
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  }
}
```

**Note:** 
- Creating a product automatically adds it to the category's and subCategory's `products` arrays
- `originalRetailPrice` is automatically set to the initial `retailPrice`

---

### Update Product

**Endpoint:** `PATCH /api/products/:id`

**Content-Type:** `multipart/form-data` or `application/json`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID (MongoDB ObjectId) |

**Request Body:** (All fields optional)
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Product name |
| `wholesalePrice` | number | Product wholesale price |
| `retailPrice` | number | Product retail price |
| `description` | string | Product description |
| `stock` | number | Product stock quantity |
| `image` | string/file | Product image URL or file upload |
| `category` | string | Category ID (MongoDB ObjectId) |
| `subCategory` | string | SubCategory ID (MongoDB ObjectId) |

**Note:** 
- Changing `category` or `subCategory` automatically updates the arrays in both the old and new categories/subCategories
- If updating `retailPrice` and the product doesn't have an active offer, `originalRetailPrice` is updated
- `retailPrice` must always be greater than `wholesalePrice`

**Example Request:**
```json
{
  "name": "Super Premium Dog Food",
  "wholesalePrice": 29.99,
  "retailPrice": 49.99,
  "stock": 150
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b7c",
    "name": "Super Premium Dog Food",
    "wholesalePrice": 29.99,
    "retailPrice": 49.99,
    "originalRetailPrice": 49.99,
    "hasActiveOffer": false,
    "activeOfferId": null,
    "description": "High-quality dog food",
    "stock": 150,
    "image": "https://example.com/dog-food.jpg",
    "category": "60d5ec49f1b2c72b8c8e4b5a",
    "subCategory": "60d5ec49f1b2c72b8c8e4b6b",
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:30:00.000Z"
  }
}
```

---

### Delete Product

**Endpoint:** `DELETE /api/products/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID (MongoDB ObjectId) |

**Note:** Deleting a product automatically removes it from the category's and subCategory's `products` arrays.

**Response:** (200 OK)
```json
{
  "status": "success",
  "message": "Product deleted"
}
```

---

## Offers

### Get All Offers

**Endpoint:** `GET /api/offers`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of items per page |
| `sort` | string | `-createdAt` | Sort field (prefix with `-` for descending) |
| `active` | boolean | - | Filter by active status |
| `current` | boolean | - | Filter by currently active offers (within date range) |

**Authentication:** Optional - Include `Authorization: Bearer <token>` header to view wholesale prices

**Example Request:**
```
GET /api/offers?page=1&limit=10&active=true&current=true
```

**Response:**
```json
{
  "status": "success",
  "results": 3,
  "paginationInfo": {
    "currentPage": 1,
    "totalPages": 1,
    "limit": 10,
    "totalDocuments": 3
  },
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4b8d",
      "title": "Summer Sale",
      "description": "Special summer discounts on selected products",
      "discount": 25,
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-08-31T23:59:59.000Z",
      "products": [
        {
          "_id": "60d5ec49f1b2c72b8c8e4b7c",
          "name": "Premium Dog Food",
          "wholesalePrice": 24.99,
          "retailPrice": 29.99,
          "image": "https://example.com/dog-food.jpg"
        }
      ],
      "active": true,
      "createdAt": "2025-05-15T12:00:00.000Z",
      "updatedAt": "2025-05-15T12:00:00.000Z"
    }
  ]
}
```

**Note:** 
- Products in the response are populated with limited fields (name, wholesalePrice, retailPrice, image)
- `wholesalePrice` is only included if a valid wholesale access token is provided
- The `current` parameter filters offers where the current date is between `startDate` and `endDate`

---

### Get Single Offer

**Endpoint:** `GET /api/offers/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Offer ID (MongoDB ObjectId) |

**Authentication:** Optional - Include `Authorization: Bearer <token>` header to view wholesale prices

**Example Request:**
```
GET /api/offers/60d5ec49f1b2c72b8c8e4b8d
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b8d",
    "title": "Summer Sale",
    "description": "Special summer discounts on selected products",
    "discount": 25,
    "startDate": "2025-06-01T00:00:00.000Z",
    "endDate": "2025-08-31T23:59:59.000Z",
    "products": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4b7c",
        "name": "Premium Dog Food",
        "wholesalePrice": 24.99,
        "retailPrice": 29.99,
        "originalRetailPrice": 39.99,
        "hasActiveOffer": true,
        "activeOfferId": "60d5ec49f1b2c72b8c8e4b8d",
        "description": "High-quality dog food",
        "stock": 100,
        "image": "https://example.com/dog-food.jpg",
        "createdAt": "2025-10-08T12:00:00.000Z",
        "updatedAt": "2025-10-08T12:00:00.000Z"
      }
    ],
    "active": true,
    "createdAt": "2025-05-15T12:00:00.000Z",
    "updatedAt": "2025-05-15T12:00:00.000Z"
  }
}
```

**Note:** 
- Products in single offer response include all product fields except `category` and `subCategory`
- `wholesalePrice` is only included if a valid wholesale access token is provided
- Products are returned in the same order as they were added to the offer

---

### Create Offer

**Endpoint:** `POST /api/offers`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Offer title (min: 3, max: 100 characters) |
| `description` | string | Yes | Offer description (min: 20 characters) |
| `discount` | number | Yes | Discount percentage (min: 1, max: 99) |
| `startDate` | date | Yes | Offer start date |
| `endDate` | date | Yes | Offer end date (must be after startDate) |
| `products` | array | Yes | Array of product IDs (at least one required) |
| `active` | boolean | No | Offer active status (default: true) |

**Validation Rules:**
- `endDate` must be after `startDate`
- All products must exist
- Products cannot already have active offers
- Discount must be between 1 and 99 percent

**Example Request:**
```json
{
  "title": "Summer Sale",
  "description": "Special summer discounts on selected products",
  "discount": 25,
  "startDate": "2025-06-01T00:00:00.000Z",
  "endDate": "2025-08-31T23:59:59.000Z",
  "products": ["60d5ec49f1b2c72b8c8e4b7c"],
  "active": true
}
```

**Response:** (201 Created)
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b8d",
    "title": "Summer Sale",
    "description": "Special summer discounts on selected products",
    "discount": 25,
    "startDate": "2025-06-01T00:00:00.000Z",
    "endDate": "2025-08-31T23:59:59.000Z",
    "products": ["60d5ec49f1b2c72b8c8e4b7c"],
    "active": true,
    "createdAt": "2025-05-15T12:00:00.000Z",
    "updatedAt": "2025-05-15T12:00:00.000Z"
  }
}
```

**Note:** 
- Creating an offer automatically applies the discount to all associated products
- Product prices are calculated as: `retailPrice = originalRetailPrice * (1 - discount / 100)`
- If the offer is active and the current date is within the date range, prices are applied immediately
- Products are marked with `hasActiveOffer: true` and `activeOfferId` is set
- Products cannot have multiple active offers simultaneously

---

### Update Offer

**Endpoint:** `PATCH /api/offers/:id`

**Request Body:** (All fields optional)
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Offer title |
| `description` | string | Offer description |
| `discount` | number | Discount percentage (1-99) |
| `startDate` | date | Offer start date |
| `endDate` | date | Offer end date |
| `products` | array | Array of product IDs |
| `active` | boolean | Offer active status |

**Note:** 
- Updating products: Products being removed have their prices restored to original values
- New products cannot already have active offers
- If `active` is set to `false`, all product prices are restored
- Date validation: `endDate` must be after `startDate` if both are provided

**Example Request:**
```json
{
  "title": "Extended Summer Sale",
  "endDate": "2025-09-30T23:59:59.000Z"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b8d",
    "title": "Extended Summer Sale",
    "description": "Special summer discounts on selected products",
    "discount": 25,
    "startDate": "2025-06-01T00:00:00.000Z",
    "endDate": "2025-09-30T23:59:59.000Z",
    "products": ["60d5ec49f1b2c72b8c8e4b7c"],
    "active": true,
    "createdAt": "2025-05-15T12:00:00.000Z",
    "updatedAt": "2025-05-20T12:00:00.000Z"
  }
}
```

---

### Delete Offer

**Endpoint:** `DELETE /api/offers/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Offer ID (MongoDB ObjectId) |

**Note:** 
- Deleting an offer automatically restores the original prices of all associated products
- Products are marked with `hasActiveOffer: false` and `activeOfferId: null`
- This is handled by the Offer model's post-delete middleware

**Response:** (204 No Content)

---

## Sliders

### Get All Sliders

**Endpoint:** `GET /api/sliders`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of items per page |

**Example Request:**
```
GET /api/sliders?page=1&limit=10
```

**Response:**
```json
{
  "status": "success",
  "results": 3,
  "totalCount": 3,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4b9e",
      "image": "https://example.com/slider1.jpg",
      "alt": "New Arrivals",
      "active": true,
      "order": 1,
      "createdAt": "2025-05-15T12:00:00.000Z",
      "updatedAt": "2025-05-15T12:00:00.000Z"
    }
  ]
}
```

**Note:** Sliders are sorted by `order` (ascending) and then by `createdAt` (descending).

---

### Get Active Sliders

**Endpoint:** `GET /api/sliders/active`

**Description:** Get all active sliders sorted by order

**Example Request:**
```
GET /api/sliders/active
```

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4b9e",
      "image": "https://example.com/slider1.jpg",
      "alt": "New Arrivals",
      "active": true,
      "order": 1,
      "createdAt": "2025-05-15T12:00:00.000Z",
      "updatedAt": "2025-05-15T12:00:00.000Z"
    }
  ]
}
```

---

### Get Single Slider

**Endpoint:** `GET /api/sliders/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Slider ID (MongoDB ObjectId) |

**Example Request:**
```
GET /api/sliders/60d5ec49f1b2c72b8c8e4b9e
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b9e",
    "image": "https://example.com/slider1.jpg",
    "alt": "New Arrivals",
    "active": true,
    "order": 1,
    "createdAt": "2025-05-15T12:00:00.000Z",
    "updatedAt": "2025-05-15T12:00:00.000Z"
  }
}
```

---

### Create Slider

**Endpoint:** `POST /api/sliders`

**Content-Type:** `multipart/form-data` or `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | string/file | Yes | Slider image URL or file upload |
| `alt` | string | No | Image alt text (default: "Slider image") |
| `active` | boolean | No | Slider active status (default: true) |
| `order` | number | No | Display order (default: 0) |

**Example Request (JSON):**
```json
{
  "image": "https://example.com/slider1.jpg",
  "alt": "New Arrivals",
  "active": true,
  "order": 1
}
```

**Example Request (Form Data):**
```
image: <file>
alt: New Arrivals
active: true
order: 1
```

**Response:** (201 Created)
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b9e",
    "image": "https://res.cloudinary.com/example/image/upload/v1234567890/slider1.jpg",
    "alt": "New Arrivals",
    "active": true,
    "order": 1,
    "createdAt": "2025-05-15T12:00:00.000Z",
    "updatedAt": "2025-05-15T12:00:00.000Z"
  }
}
```

---

### Toggle Slider Status

**Endpoint:** `PATCH /api/sliders/:id/toggle-status`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Slider ID (MongoDB ObjectId) |

**Description:** Toggle the active status of a slider

**Example Request:**
```
PATCH /api/sliders/60d5ec49f1b2c72b8c8e4b9e/toggle-status
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b9e",
    "image": "https://example.com/slider1.jpg",
    "alt": "New Arrivals",
    "active": false,
    "order": 1,
    "createdAt": "2025-05-15T12:00:00.000Z",
    "updatedAt": "2025-05-20T12:00:00.000Z"
  }
}
```

---

### Delete Slider

**Endpoint:** `DELETE /api/sliders/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Slider ID (MongoDB ObjectId) |

**Response:** (204 No Content)

---

## Search

### Search All

**Endpoint:** `GET /api/search`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query string |

**Authentication:** Optional - Include `Authorization: Bearer <token>` header to view wholesale prices

**Description:** Search across products, categories, subcategories, and offers by name and description

**Example Request:**
```
GET /api/search?query=dog food
```

**Response:**
```json
{
  "status": "success",
  "results": {
    "products": {
      "count": 5,
      "data": [
        {
          "_id": "60d5ec49f1b2c72b8c8e4b7c",
          "name": "Premium Dog Food",
          "wholesalePrice": 24.99,
          "retailPrice": 29.99,
          "description": "High-quality dog food",
          "stock": 100,
          "image": "https://example.com/dog-food.jpg",
          "category": {
            "_id": "60d5ec49f1b2c72b8c8e4b5a",
            "name": "Dogs"
          },
          "subCategory": {
            "_id": "60d5ec49f1b2c72b8c8e4b6b",
            "name": "Food"
          },
          "createdAt": "2025-10-08T12:00:00.000Z",
          "updatedAt": "2025-10-08T12:00:00.000Z"
        }
      ]
    },
    "categories": {
      "count": 1,
      "data": [
        {
          "_id": "60d5ec49f1b2c72b8c8e4b5a",
          "name": "Dogs",
          "description": "Products for dogs",
          "image": "https://example.com/dogs.jpg",
          "createdAt": "2025-10-08T12:00:00.000Z",
          "updatedAt": "2025-10-08T12:00:00.000Z"
        }
      ]
    },
    "subCategories": {
      "count": 1,
      "data": [
        {
          "_id": "60d5ec49f1b2c72b8c8e4b6b",
          "name": "Food",
          "description": "Dog food products",
          "category": {
            "_id": "60d5ec49f1b2c72b8c8e4b5a",
            "name": "Dogs"
          },
          "createdAt": "2025-10-08T12:00:00.000Z",
          "updatedAt": "2025-10-08T12:00:00.000Z"
        }
      ]
    },
    "offers": {
      "count": 1,
      "data": [
        {
          "_id": "60d5ec49f1b2c72b8c8e4b8d",
          "title": "Summer Sale",
          "description": "Special summer discounts on selected products",
          "discount": 25,
          "startDate": "2025-06-01T00:00:00.000Z",
          "endDate": "2025-08-31T23:59:59.000Z",
          "products": [],
          "active": true,
          "createdAt": "2025-05-15T12:00:00.000Z",
          "updatedAt": "2025-05-15T12:00:00.000Z"
        }
      ]
    }
  }
}
```

**Note:** 
- Search is case-insensitive
- Searches in `name` and `description` fields
- Products include populated `category` and `subCategory`
- SubCategories include populated `category`
- Offers include populated `products` (with limited fields)
- `wholesalePrice` is only included if a valid wholesale access token is provided

---

## Error Handling

The API uses a consistent error handling format:

```json
{
  "status": "error",
  "message": "Error message",
  "stack": "Error stack trace (only in development mode)"
}
```

### Common Error Codes

- `400` - Bad Request (invalid input data, validation errors)
- `401` - Unauthorized (authentication required, invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (resource already exists, duplicate entries)
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (database connection issues)

### Common Error Messages

- `"Email is required to request wholesale access"`
- `"Invalid OTP code"`
- `"No valid OTP found or OTP has expired"`
- `"Invalid wholesale access token format"`
- `"Invalid or expired wholesale access token"`
- `"Category not found"`
- `"SubCategory not found"`
- `"Product not found"`
- `"Offer not found"`
- `"Some products do not exist"`
- `"Some products already have active offers: <product names>"`
- `"retailPrice must be greater than wholesalePrice"`
- `"subCategory does not belong to category"`
- `"End date must be after start date"`
- `"Too many requests from this IP, please try again in an hour!"`

---

## Data Models

### Category Model

```javascript
{
  _id: ObjectId,
  name: String,                    // Required, unique, trimmed
  description: String,             // Required, trimmed
  image: String,                   // Optional, trimmed
  products: [ObjectId],            // References to Product model, default: []
  subCategories: [ObjectId],       // References to SubCategory model, default: []
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name` (unique)
- `createdAt` (descending)

---

### SubCategory Model

```javascript
{
  _id: ObjectId,
  name: String,                    // Required, trimmed
  description: String,             // Required, trimmed
  image: String,                   // Optional, trimmed
  category: ObjectId,              // Reference to Category model, required
  products: [ObjectId],            // References to Product model, default: []
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name` + `category` (unique compound index)
- `category`
- `createdAt` (descending)

---

### Product Model

```javascript
{
  _id: ObjectId,
  name: String,                    // Required, trimmed
  wholesalePrice: Number,          // Required, min: 0
  retailPrice: Number,             // Required, min: 0
  originalRetailPrice: Number,     // Default: same as retailPrice
  hasActiveOffer: Boolean,         // Default: false
  activeOfferId: ObjectId,         // Reference to Offer model, default: null
  description: String,             // Optional, trimmed
  stock: Number,                   // Required, min: 0
  image: String,                   // Optional, trimmed
  category: ObjectId,              // Reference to Category model, required
  subCategory: ObjectId,           // Reference to SubCategory model, required
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name` + `category` + `subCategory` (unique compound index)
- `category`
- `subCategory`
- `retailPrice`
- `wholesalePrice`
- `createdAt` (descending)

**Validation:**
- `retailPrice` must be greater than `wholesalePrice`
- Product name must be unique within category and subCategory combination

---

### Offer Model

```javascript
{
  _id: ObjectId,
  title: String,                   // Required, trimmed, min: 3, max: 100
  description: String,             // Required, min: 20
  discount: Number,                // Required, min: 1, max: 99
  startDate: Date,                 // Required
  endDate: Date,                   // Required
  products: [ObjectId],            // References to Product model, required (at least one)
  active: Boolean,                 // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

**Validation:**
- `endDate` must be after `startDate`
- `discount` must be between 1 and 99 percent

**Middleware:**
- Pre-find: Automatically populates products with limited fields (name, wholesalePrice, retailPrice, image)
- Pre-save: Validates that endDate is after startDate
- Post-save: Automatically applies discount to products if offer is active and within date range
- Post-findOneAndDelete: Automatically restores original prices when offer is deleted

---

### Slider Model

```javascript
{
  _id: ObjectId,
  image: String,                   // Required, trimmed
  alt: String,                     // Default: "Slider image"
  active: Boolean,                 // Default: true
  order: Number,                   // Default: 0
  createdAt: Date,
  updatedAt: Date
}
```

---

### WholesaleAccessToken Model

```javascript
{
  _id: ObjectId,
  email: String,                   // Required, trimmed, lowercase
  otpHash: String,                 // Required, not selected by default
  expiresAt: Date,                 // Required, TTL index (expires after 2 hours)
  usedAt: Date,                    // Default: null
  meta: {
    ip: String,                    // Optional
    userAgent: String              // Optional
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `expiresAt` (TTL index, expires after 0 seconds - handled by application)

---

## Model Relationships

### Category Relationships

- **Has many SubCategories:** Category maintains a `subCategories` array that is automatically updated when subcategories are created, updated, or deleted
- **Has many Products:** Category maintains a `products` array that is automatically updated when products are created, updated, or deleted
- **Maintenance:** When a subcategory or product is created/updated/deleted, the parent category's arrays are automatically maintained

### SubCategory Relationships

- **Belongs to Category:** SubCategory has a `category` reference that must exist
- **Has many Products:** SubCategory maintains a `products` array that is automatically updated when products are created, updated, or deleted
- **Maintenance:** When a product is created/updated/deleted, the subcategory's `products` array is automatically maintained
- **Category Change:** When a subcategory's category is changed, all associated products are moved to the new category, and arrays are updated in both old and new categories

### Product Relationships

- **Belongs to Category:** Product has a `category` reference that must exist
- **Belongs to SubCategory:** Product has a `subCategory` reference that must exist and must belong to the specified category
- **Can have one Active Offer:** Product can have at most one active offer at a time
- **Maintenance:** When a product is created/updated/deleted, both category and subcategory arrays are automatically maintained
- **Category/SubCategory Change:** When a product's category or subcategory is changed, arrays are updated in both old and new categories/subcategories

### Offer Relationships

- **Has many Products:** Offer has a `products` array referencing product IDs
- **Price Management:** When an offer is created/updated/deleted, product prices are automatically managed:
  - **Create:** Applies discount to products (if active and within date range)
  - **Update:** Restores prices for removed products, applies discount to new products
  - **Delete:** Restores original prices for all products
- **Product Constraints:** Products cannot have multiple active offers simultaneously
- **Automatic Expiration:** Expired offers are automatically deactivated by the scheduler

---

## Utilities

### Offer Scheduler

The application includes an automated offer scheduler that runs **every hour** to check for expired offers. When an offer expires:

1. The offer's `active` status is set to `false`
2. All associated products have their prices restored to the original values (`originalRetailPrice`)
3. Product `hasActiveOffer` flag is set to `false`
4. Product `activeOfferId` is set to `null`

**Schedule:** Runs every hour at minute 0 (cron: `0 * * * *`)

**Initialization:** The scheduler runs once immediately on server startup to catch already expired offers

This ensures that time-limited offers are automatically handled without manual intervention.

---

### Image Upload

The application uses Cloudinary for image storage. Images can be uploaded in two ways:

1. **File Upload (multipart/form-data):** Upload image files directly via form data
2. **URL (application/json):** Provide image URLs directly in the request body

**Supported Endpoints:**
- `POST /api/categories` - Upload category image
- `PATCH /api/categories/:id` - Update category image
- `POST /api/subcategories` - Upload subcategory image
- `PATCH /api/subcategories/:id` - Update subcategory image
- `POST /api/products` - Upload product image
- `PATCH /api/products/:id` - Update product image
- `POST /api/sliders` - Upload slider image

**Cloudinary Folders:**
- Categories: `categories`
- SubCategories: `subcategories`
- Products: `products`
- Sliders: `sliders`

**Response Format:**
```json
{
  "secure_url": "https://res.cloudinary.com/example/image/upload/v1234567890/folder/image.jpg",
  "public_id": "folder/image"
}
```

---

### Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit:** 100 requests per hour per IP address
- **Window:** 60 minutes (1 hour)
- **Error Response:** 429 Too Many Requests
- **Message:** "Too many requests from this IP, please try again in an hour!"

---

### Security Features

- **Data Sanitization:** Protection against NoSQL query injection using `express-mongo-sanitize`
- **Request Size Limit:** Request body size limited to 20KB
- **CORS:** Enabled for cross-origin requests
- **Compression:** Response compression for improved performance
- **JWT Authentication:** Secure token-based authentication for wholesale access
- **OTP Expiration:** OTP codes expire after 2 hours
- **Token Expiration:** JWT tokens expire after 2 hours (configurable)

---

### Email Notifications

The application sends email notifications for wholesale access requests:

- **Recipient:** Admin email (configured via `ADMIN_EMAIL` environment variable)
- **Subject:** "Wholesale Access Request | طلب الوصول إلى أسعار الجملة"
- **Content:** Includes requester email and OTP code
- **Format:** HTML email with bilingual support (English/Arabic)
- **OTP Expiration:** OTP codes expire after 2 hours

**Configuration Required:**
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port (typically 465 for SSL)
- `EMAIL_USER` - SMTP username
- `EMAIL_PASSWORD` - SMTP password
- `ADMIN_EMAIL` - Admin email address for notifications

---

## Environment Variables

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `Development` or `Production` |
| `PORT` | Server port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/mo-pets` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `WHOLESALE_JWT_SECRET` | JWT secret for wholesale access | `your-jwt-secret-key` |
| `EMAIL_HOST` | SMTP host for email notifications | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `465` |
| `EMAIL_USER` | SMTP username | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | SMTP password | `your-email-password` |
| `ADMIN_EMAIL` | Admin email for notifications | `admin@example.com` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WHOLESALE_JWT_EXPIRES_IN` | JWT token expiration time | `2h` |

### Example .env File

```env
NODE_ENV=Development
PORT=3000
MONGO_URI=mongodb://localhost:27017/mo-pets
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
WHOLESALE_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
WHOLESALE_JWT_EXPIRES_IN=2h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@example.com
```

---

## Swagger Documentation

Interactive API documentation is available at:

```
/docs
```

Swagger JSON is available at:

```
/swagger.json
```

This provides a user-friendly interface to explore and test all API endpoints.

---

## Additional Notes

### Product Price Management

- **Original Retail Price:** Stored in `originalRetailPrice` field, used to restore prices when offers expire or are deleted
- **Active Offer Price:** When a product has an active offer, `retailPrice` reflects the discounted price
- **Price Restoration:** Prices are automatically restored when offers are deleted, deactivated, or expire

### Offer Price Calculation

Discount is applied as a percentage reduction:
```
discountedPrice = originalRetailPrice * (1 - discount / 100)
```

Example:
- Original price: $100
- Discount: 25%
- Discounted price: $100 * (1 - 0.25) = $75

### Array Maintenance

The application automatically maintains arrays in Category and SubCategory models:

- **Product Creation:** Product is added to both category and subcategory `products` arrays
- **Product Deletion:** Product is removed from both category and subcategory `products` arrays
- **Product Update (Category Change):** Product is removed from old category and added to new category
- **Product Update (SubCategory Change):** Product is removed from old subcategory and added to new subcategory
- **SubCategory Creation:** SubCategory is added to category's `subCategories` array
- **SubCategory Deletion:** SubCategory is removed from category's `subCategories` array, and all products are removed from category's `products` array
- **SubCategory Update (Category Change):** SubCategory is moved between categories, and all products are moved accordingly

### Wholesale Access Flow

1. **Request Access:** Client requests wholesale access with email
2. **OTP Generation:** Server generates 6-digit OTP and sends to admin email
3. **OTP Sharing:** Admin shares OTP with requester
4. **OTP Verification:** Client verifies OTP to receive JWT token
5. **Token Usage:** Client includes token in `Authorization` header for subsequent requests
6. **Token Expiration:** Token expires after 2 hours (configurable)

---

## Support

For issues, questions, or contributions, please contact the development team.

---

**Last Updated:** 2025-01-08
