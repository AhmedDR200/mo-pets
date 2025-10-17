# Mo Pets API Documentation

Base URL: `https://mo-pets.vercel.app`

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
- [Error Handling](#error-handling)
- [Data Models](#data-models)
- [Utilities](#utilities)

---

## Introduction

This API provides endpoints for managing a pet store application. It includes functionality for managing categories, subcategories, products, special offers, and promotional sliders.

### Key Features

- RESTful API design
- MongoDB database with Mongoose ODM
- Express.js framework
- Cloudinary integration for image storage
- Automated offer expiration handling
- Rate limiting and security features
- Swagger documentation

---

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=Development
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
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
- `middleware/` - Express middleware
- `models/` - Mongoose models
- `routes/` - API routes
- `utils/` - Utility functions
- `server.js` - Main application entry point

---

## Health Check

### Get Server Health

**Endpoint:** `GET /api/health`

**Description:** Check if the server is running and verify database connection status

**Response:**

```json
{
  "status": "success",
  "message": "Server is running!",
  "timestamp": "2025-10-08T12:00:00.000Z",
  "database": {
    "status": "connected",
    "latency": "5ms"
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

**Example Request:**

```
GET /api/categories/60d5ec49f1b2c72b8c8e4b5a
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
    "products": [],
    "subCategories": [],
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  }
}
```

---

### Create Category

**Endpoint:** `POST /api/categories`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Category name (must be unique) |
| `description` | string | Yes | Category description |
| `image` | string | No | Category image URL |

**Example Request:**

```json
{
  "name": "Dogs",
  "description": "Products for dogs",
  "image": "https://example.com/dogs.jpg"
}
```

**Response:** (201 Created)

```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b5a",
    "name": "Dogs",
    "description": "Products for dogs",
    "image": "https://example.com/dogs.jpg",
    "products": [],
    "subCategories": [],
    "createdAt": "2025-10-08T12:00:00.000Z",
    "updatedAt": "2025-10-08T12:00:00.000Z"
  }
}
```

---

### Update Category

**Endpoint:** `PUT /api/categories/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Category ID (MongoDB ObjectId) |

**Request Body:** (All fields optional)
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Category name (must be unique) |
| `description` | string | Category description |
| `image` | string | Category image URL |

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

**Note:** Deleting a category will also delete all associated subcategories and products.

**Response:**

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

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | SubCategory name (must be unique within category) |
| `description` | string | Yes | SubCategory description |
| `category` | string | Yes | Parent category ID (MongoDB ObjectId) |
| `image` | string | No | SubCategory image URL |

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

---

### Update SubCategory

**Endpoint:** `PUT /api/subcategories/:id`

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
| `image` | string | SubCategory image URL |

**Note:** Changing the category will also move all associated products to the new category.

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

**Note:** Deleting a subcategory will also delete all associated products.

**Response:**

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
| `minPrice` | number | - | Filter by minimum price |
| `maxPrice` | number | - | Filter by maximum price |
| `hasOffer` | boolean | - | Filter products with active offers |

**Example Request:**

```
GET /api/products?page=1&limit=10&category=60d5ec49f1b2c72b8c8e4b5a&minPrice=10&maxPrice=50
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
      "price": 29.99,
      "originalPrice": 39.99,
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

---

### Get Single Product

**Endpoint:** `GET /api/products/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID (MongoDB ObjectId) |

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
    "price": 29.99,
    "originalPrice": 39.99,
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

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Product name |
| `price` | number | Yes | Product price |
| `description` | string | No | Product description |
| `stock` | number | Yes | Product stock quantity |
| `image` | string | No | Product image URL |
| `category` | string | Yes | Category ID (MongoDB ObjectId) |
| `subCategory` | string | Yes | SubCategory ID (MongoDB ObjectId) |

**Example Request:**

```json
{
  "name": "Premium Dog Food",
  "price": 39.99,
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
    "price": 39.99,
    "originalPrice": 39.99,
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

---

### Update Product

**Endpoint:** `PUT /api/products/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID (MongoDB ObjectId) |

**Request Body:** (All fields optional)
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Product name |
| `price` | number | Product price |
| `description` | string | Product description |
| `stock` | number | Product stock quantity |
| `image` | string | Product image URL |
| `category` | string | Category ID (MongoDB ObjectId) |
| `subCategory` | string | SubCategory ID (MongoDB ObjectId) |

**Example Request:**

```json
{
  "name": "Super Premium Dog Food",
  "price": 49.99,
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
    "price": 49.99,
    "originalPrice": 49.99,
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

**Response:**

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

**Example Request:**

```
GET /api/offers?page=1&limit=10&active=true
```

**Response:**

```json
{
  "status": "success",
  "results": 3,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3
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
          "price": 29.99
        }
      ],
      "active": true,
      "createdAt": "2025-05-15T12:00:00.000Z",
      "updatedAt": "2025-05-15T12:00:00.000Z"
    }
  ]
}
```

---

### Get Single Offer

**Endpoint:** `GET /api/offers/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Offer ID (MongoDB ObjectId) |

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
        "price": 29.99,
        "originalPrice": 39.99
      }
    ],
    "active": true,
    "createdAt": "2025-05-15T12:00:00.000Z",
    "updatedAt": "2025-05-15T12:00:00.000Z"
  }
}
```

---

### Create Offer

**Endpoint:** `POST /api/offers`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Offer title |
| `description` | string | Yes | Offer description |
| `discount` | number | Yes | Discount percentage (1-99) |
| `startDate` | date | Yes | Offer start date |
| `endDate` | date | Yes | Offer end date |
| `products` | array | Yes | Array of product IDs |

**Example Request:**

```json
{
  "title": "Summer Sale",
  "description": "Special summer discounts on selected products",
  "discount": 25,
  "startDate": "2025-06-01T00:00:00.000Z",
  "endDate": "2025-08-31T23:59:59.000Z",
  "products": ["60d5ec49f1b2c72b8c8e4b7c"]
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

**Note:** Creating an offer will automatically update the prices of all associated products based on the discount percentage.

---

### Update Offer

**Endpoint:** `PUT /api/offers/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Offer ID (MongoDB ObjectId) |

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

**Note:** Updating an offer's discount or products will automatically update the prices of all associated products.

---

### Delete Offer

**Endpoint:** `DELETE /api/offers/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Offer ID (MongoDB ObjectId) |

**Response:**

```json
{
  "status": "success",
  "message": "Offer deleted"
}
```

**Note:** Deleting an offer will restore the original prices of all associated products.

---

## Sliders

### Get All Sliders

**Endpoint:** `GET /api/sliders`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of items per page |
| `sort` | string | `-createdAt` | Sort field (prefix with `-` for descending) |
| `active` | boolean | - | Filter by active status |

**Example Request:**

```
GET /api/sliders?page=1&limit=10&active=true
```

**Response:**

```json
{
  "status": "success",
  "results": 3,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3
  },
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4b9e",
      "title": "New Arrivals",
      "description": "Check out our latest products",
      "image": "https://example.com/slider1.jpg",
      "link": "/products?sort=-createdAt",
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
    "title": "New Arrivals",
    "description": "Check out our latest products",
    "image": "https://example.com/slider1.jpg",
    "link": "/products?sort=-createdAt",
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

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Slider title |
| `description` | string | No | Slider description |
| `image` | string | Yes | Slider image URL |
| `link` | string | No | Slider link URL |
| `active` | boolean | No | Slider active status (default: true) |
| `order` | number | No | Display order (default: last position) |

**Example Request:**

```json
{
  "title": "New Arrivals",
  "description": "Check out our latest products",
  "image": "https://example.com/slider1.jpg",
  "link": "/products?sort=-createdAt",
  "active": true,
  "order": 1
}
```

**Response:** (201 Created)

```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b9e",
    "title": "New Arrivals",
    "description": "Check out our latest products",
    "image": "https://example.com/slider1.jpg",
    "link": "/products?sort=-createdAt",
    "active": true,
    "order": 1,
    "createdAt": "2025-05-15T12:00:00.000Z",
    "updatedAt": "2025-05-15T12:00:00.000Z"
  }
}
```

---

### Update Slider

**Endpoint:** `PUT /api/sliders/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Slider ID (MongoDB ObjectId) |

**Request Body:** (All fields optional)
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Slider title |
| `description` | string | Slider description |
| `image` | string | Slider image URL |
| `link` | string | Slider link URL |
| `active` | boolean | Slider active status |
| `order` | number | Display order |

**Example Request:**

```json
{
  "title": "Summer Collection",
  "description": "Explore our summer collection",
  "active": true
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b9e",
    "title": "Summer Collection",
    "description": "Explore our summer collection",
    "image": "https://example.com/slider1.jpg",
    "link": "/products?sort=-createdAt",
    "active": true,
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

**Response:**

```json
{
  "status": "success",
  "message": "Slider deleted"
}
```

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

- `400` - Bad Request (invalid input data)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (resource already exists)
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Data Models

### Category Model

```javascript
{
  name: String,          // Required, unique
  description: String,   // Required
  image: String,         // Optional
  products: [Product],   // References to Product model
  subCategories: [SubCategory], // References to SubCategory model
  createdAt: Date,
  updatedAt: Date
}
```

### SubCategory Model

```javascript
{
  name: String,          // Required, unique within category
  description: String,   // Required
  image: String,         // Optional
  category: Category,    // Reference to Category model
  products: [Product],   // References to Product model
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model

```javascript
{
  name: String,          // Required
  price: Number,         // Required, min: 0
  originalPrice: Number, // Default: same as price
  hasActiveOffer: Boolean, // Default: false
  activeOfferId: ObjectId, // Reference to Offer model
  description: String,   // Optional
  stock: Number,         // Required, min: 0
  image: String,         // Optional
  category: Category,    // Reference to Category model
  subCategory: SubCategory, // Reference to SubCategory model
  createdAt: Date,
  updatedAt: Date
}
```

### Offer Model

```javascript
{
  title: String,         // Required
  description: String,   // Required
  discount: Number,      // Required, min: 1, max: 99
  startDate: Date,       // Required
  endDate: Date,         // Required
  products: [Product],   // References to Product model
  active: Boolean,       // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

### Slider Model

```javascript
{
  title: String,         // Required
  description: String,   // Optional
  image: String,         // Required
  link: String,          // Optional
  active: Boolean,       // Default: true
  order: Number,         // Default: last position
  createdAt: Date,
  updatedAt: Date
}
```

---

## Utilities

### Offer Scheduler

The application includes an automated offer scheduler that runs daily to check for expired offers. When an offer expires:

1. The offer's `active` status is set to `false`
2. All associated products have their prices restored to the original values
3. Product `hasActiveOffer` flag is set to `false`
4. Product `activeOfferId` is set to `null`

This ensures that time-limited offers are automatically handled without manual intervention.

### Image Upload

The application uses Cloudinary for image storage. Images can be uploaded using the following endpoints:

**Endpoint:** `POST /api/upload`

**Request Body:** (Form data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | Yes | Image file to upload |

**Response:**

```json
{
  "status": "success",
  "data": {
    "url": "https://res.cloudinary.com/example/image/upload/v1234567890/abcdef.jpg",
    "public_id": "abcdef"
  }
}
```

### Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per hour per IP address
- When exceeded, returns a 429 Too Many Requests error

### Security Features

- Data sanitization against NoSQL query injection
- Request body size limited to 20KB
- CORS enabled for cross-origin requests
- Compression for improved performance

---

## Swagger Documentation

Interactive API documentation is available at:

```
/api-docs
```

This provides a user-friendly interface to explore and test all API endpoints.
