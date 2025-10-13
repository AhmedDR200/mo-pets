# API Documentation

Base URL: `https://mo-pets.vercel.app`

## Table of Contents
- [Health Check](#health-check)
- [Categories](#categories)
- [SubCategories](#subcategories)
- [Products](#products)

---

## Health Check

### Get Server Health
**Endpoint:** `GET /api/health`

**Description:** Check if the server is running

**Response:**
```json
{
  "status": "success",
  "message": "Server is running!",
  "timestamp": "2025-10-08T12:00:00.000Z"
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

**Example Request:**
```
GET /api/products?page=1&limit=10&category=60d5ec49f1b2c72b8c8e4b5a&sort=-price
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
      "_id": "60d5ec49f1b2c72b8c8e4b7c",
      "name": "Premium Dog Food 5kg",
      "price": 29.99,
      "description": "High-quality dog food for all breeds",
      "stock": 100,
      "image": "https://example.com/product.jpg",
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
    "name": "Premium Dog Food 5kg",
    "price": 29.99,
    "description": "High-quality dog food for all breeds",
    "stock": 100,
    "image": "https://example.com/product.jpg",
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
| `price` | number | Yes | Product price (must be >= 0) |
| `stock` | number | Yes | Product stock quantity (must be >= 0) |
| `category` | string | Yes | Category ID (MongoDB ObjectId) |
| `subCategory` | string | Yes | SubCategory ID (MongoDB ObjectId) |
| `description` | string | No | Product description |
| `image` | string | No | Product image URL |

**Note:** The subcategory must belong to the specified category.

**Example Request:**
```json
{
  "name": "Premium Dog Food 5kg",
  "price": 29.99,
  "description": "High-quality dog food for all breeds",
  "stock": 100,
  "category": "60d5ec49f1b2c72b8c8e4b5a",
  "subCategory": "60d5ec49f1b2c72b8c8e4b6b",
  "image": "https://example.com/product.jpg"
}
```

**Response:** (201 Created)
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b7c",
    "name": "Premium Dog Food 5kg",
    "price": 29.99,
    "description": "High-quality dog food for all breeds",
    "stock": 100,
    "image": "https://example.com/product.jpg",
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
| `price` | number | Product price (must be >= 0) |
| `stock` | number | Product stock quantity (must be >= 0) |
| `category` | string | Category ID (MongoDB ObjectId) |
| `subCategory` | string | SubCategory ID (MongoDB ObjectId) |
| `description` | string | Product description |
| `image` | string | Product image URL |

**Note:** If updating category/subcategory, the subcategory must belong to the specified category.

**Example Request:**
```json
{
  "price": 24.99,
  "stock": 150
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4b7c",
    "name": "Premium Dog Food 5kg",
    "price": 24.99,
    "description": "High-quality dog food for all breeds",
    "stock": 150,
    "image": "https://example.com/product.jpg",
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

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid product id"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Product not found"
}
```

### 409 Conflict
```json
{
  "status": "error",
  "message": "Category name already exists"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Data Relationships

- A **Category** can have multiple **SubCategories** and **Products**
- A **SubCategory** belongs to one **Category** and can have multiple **Products**
- A **Product** belongs to one **Category** and one **SubCategory**
- Deleting a **Category** cascades to delete all its **SubCategories** and **Products**
- Deleting a **SubCategory** cascades to delete all its **Products**
- Moving a **SubCategory** to a different **Category** also moves all its **Products**

---

## Notes

1. All IDs are MongoDB ObjectIds (24-character hexadecimal strings)
2. Timestamps (`createdAt`, `updatedAt`) are automatically managed
3. The API supports pagination on all list endpoints
4. Sorting can be done on any field (use `-` prefix for descending order)
5. Category names must be globally unique
6. SubCategory names must be unique within their parent category
7. Product names must be unique within their category and subcategory combination


