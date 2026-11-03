# Kadai Backend — API Testing Guide

**Base URL:** `http://localhost:6000/api/v1`
Start the server with `npm start`, seed demo data with `npm run seed`.

## Postman setup

1. Create a collection variable `base_url` = `http://localhost:6000/api/v1`
2. After login, copy the `token` from the response into a collection variable `token`
3. For protected routes: **Authorization tab → Type: Bearer Token → `{{token}}`**
   (token expires after 1 hour — login again if you get token errors)
4. For all POST/PUT/PATCH bodies: **Body → raw → JSON**

---

## 1. Health check

| Method | URL | Auth |
|--------|-----|------|
| GET | `http://localhost:6000/` | No |

Response `200`: `{ "message": "Api is running" }`

---

## 2. Auth

### Signup
`POST {{base_url}}/signup`
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "mypassword123"
}
```
→ `201` user object | `400` "All fields are required" | `500` "User already exists"

### Login
`POST {{base_url}}/login`
```json
{
  "email": "test@example.com",
  "password": "mypassword123"
}
```
→ `200` `{ "user": {...}, "token": "eyJhbG..." }` — **save the token**

### Logout
`POST {{base_url}}/logout` — Bearer token → `200`

---

## 3. Categories

| Method | URL | Auth | Body |
|--------|-----|------|------|
| GET | `{{base_url}}/categories` | No | — |
| GET | `{{base_url}}/categories/:id` | No | — |
| POST | `{{base_url}}/categories` | Yes | below |
| PUT | `{{base_url}}/categories/:id` | Yes | any field |
| DELETE | `{{base_url}}/categories/:id` | Yes | — |

**POST body:**
```json
{ "name": "Gaming", "description": "Gaming gear and accessories" }
```
→ `201` category (slug auto-generated) | `400` "Category already exists"

**DELETE** → `200` | `400` "Category has N product(s) and cannot be deleted" | `404`

Seeded categories: Electronics, Footwear, Home & Kitchen, Clothing, Accessories, Bags

---

## 4. Products

### List products (powers the listing page: filters, sort, pagination, search)
`GET {{base_url}}/products` — public

**Query params** (all optional, combine freely):

| Param | Values | Screen feature |
|-------|--------|----------------|
| `search` | any text | Navbar search (name/brand/tags/description) |
| `category` | name, slug or ObjectId — comma-separated e.g. `Electronics,Bags` | Category checkboxes |
| `minPrice` / `maxPrice` | numbers | Price range inputs |
| `minRating` | `4` or `3` | "4 stars & up" radios |
| `sort` | `featured` (default), `price-asc`, `price-desc`, `rating`, `newest` | Sort dropdown |
| `page` | default `1` | Pagination |
| `limit` | default `12`, max `50` | Page size |
| `featured` | `true` | Featured only |

**Examples:**
```
GET {{base_url}}/products?category=Electronics&minRating=4&page=1&limit=8
GET {{base_url}}/products?search=headphones
GET {{base_url}}/products?minPrice=20&maxPrice=100&sort=price-asc
```

**Response `200`:**
```json
{
  "products": [
    {
      "_id": "...",
      "name": "Wireless Over-Ear Headphones",
      "price": 79.99,
      "comparePrice": 99.99,
      "discountPercentage": 20,
      "rating": 4.5,
      "reviewCount": 128,
      "stock": 34,
      "stockStatus": "in_stock",
      "images": ["..."],
      "category": { "_id": "...", "name": "Electronics", "slug": "electronics" }
    }
  ],
  "pagination": { "total": 9, "page": 1, "limit": 8, "totalPages": 2, "hasNextPage": true, "hasPrevPage": false }
}
```
`stockStatus`: `in_stock` | `low_stock` (≤10 → "Only X left" badge) | `out_of_stock`

### Get one product (detail page)
`GET {{base_url}}/products/:id` → `200` full product incl. `specifications`, `returnPolicy`, `warrantyInformation`, `brand`, `tags` | `400` invalid id | `404`

### Related products ("You may also like")
`GET {{base_url}}/products/:id/related` → `200` array of up to 4 same-category products

### Create / update / delete (authenticated)
`POST {{base_url}}/products`
```json
{
  "name": "Mechanical Keyboard",
  "description": "Hot-swappable 75% mechanical keyboard with RGB backlight.",
  "category": "<electronics category _id>",
  "brand": "Kadai Tech",
  "price": 89.00,
  "comparePrice": 119.00,
  "images": ["https://example.com/kb1.jpg", "https://example.com/kb2.jpg"],
  "stock": 50,
  "rating": 4.6,
  "reviewCount": 42,
  "tags": ["keyboard", "mechanical", "rgb"],
  "specifications": { "Switch": "Gateron Brown", "Layout": "75%", "Battery": "4000mAh" },
  "returnPolicy": "7-day returns",
  "warrantyInformation": "1 year warranty",
  "isFeatured": true
}
```
→ `201` | `400` missing required fields | `404` bad category id

`PUT {{base_url}}/products/:id` — send only fields to change, e.g. `{ "price": 69.99, "stock": 100 }`

`DELETE {{base_url}}/products/:id` — soft-deletes (`isActive=false`), hidden from all queries

---

## 5. Coupons

| Method | URL | Auth | Body |
|--------|-----|------|------|
| GET | `{{base_url}}/coupons` | Yes | — |
| POST | `{{base_url}}/coupons` | Yes | `{ "code": "FLAT20", "discountPercent": 20, "minOrderAmount": 100, "expiresAt": "2026-12-31" }` |
| POST | `{{base_url}}/coupons/validate` | Yes | below |

### Validate / preview coupon (frontend cart's "Apply" button)
`POST {{base_url}}/coupons/validate`
```json
{ "code": "SAVE10", "subtotal": 233.98 }
```
→ `200` `{ "code": "SAVE10", "discountPercent": 10, "discount": 23.4 }`
→ `400` "Invalid coupon code" / "Coupon has expired" / "Coupon requires a minimum order of $X"

Seeded coupon: **SAVE10** = 10% off

---

## 6. Orders (checkout — cart lives in frontend context)

### Place order
`POST {{base_url}}/orders` — Bearer token
```json
{
  "items": [
    { "productId": "<headphones _id>", "quantity": 1 },
    { "productId": "<running shoes _id>", "quantity": 2 }
  ],
  "couponCode": "SAVE10",
  "shippingAddress": {
    "name": "Test User",
    "phone": "9876543210",
    "line1": "12 MG Road",
    "city": "Chennai",
    "state": "TN",
    "postalCode": "600001",
    "country": "India"
  }
}
```

- Prices/discounts are **recomputed server-side** — client prices are ignored
- Stock is validated, then **decremented** automatically
- Shipping: **FREE** if (subtotal − coupon) ≥ $50, else **$5.99**

→ `201` order:
```json
{
  "_id": "...",
  "user": "...",
  "items": [{ "product": "...", "name": "Wireless Over-Ear Headphones", "price": 79.99, "quantity": 1, "image": "..." }],
  "subtotal": 208.99,
  "couponCode": "SAVE10",
  "couponDiscount": 20.9,
  "shipping": 0,
  "total": 188.09,
  "status": "pending",
  "paymentStatus": "pending"
}
```
→ `400` "Order items are required" / `"X" only has N left in stock` | `404` product not found

### My orders
`GET {{base_url}}/orders?page=1&limit=10` → `200` `{ orders, pagination }`

### Order detail
`GET {{base_url}}/orders/:id` → `200` | `404` (only your own orders visible)

### Cancel order (restocks items)
`POST {{base_url}}/orders/:id/cancel`
→ `200` status → `cancelled` | `400` if already shipped/delivered/cancelled

### Update status
`PATCH {{base_url}}/orders/:id/status`
```json
{ "status": "shipped" }
```
Allowed: `pending`, `processing`, `shipped`, `delivered`, `cancelled` (cancelling restocks)

---

## Suggested test flow

1. `GET /` → health check
2. `POST /signup` → `POST /login` → copy `token`
3. `GET /categories` → copy a category `_id`
4. `GET /products` → try filters: `?category=Electronics&minRating=4`, `?search=watch`, `?sort=price-asc`
5. `GET /products/:id` → copy a product `_id`; `GET /products/:id/related`
6. `POST /coupons/validate` with `SAVE10`
7. `POST /orders` with items + `SAVE10` → note the `total`
8. `GET /products/:id` again → confirm `stock` decreased
9. `GET /orders` → `GET /orders/:id`
10. `POST /orders/:id/cancel` → `GET /products/:id` → stock restored
11. `POST /categories`, `POST /products`, `PUT`, `DELETE` to test admin-style writes
12. Negative tests: no token on protected route → `401`; bad coupon → `400`; quantity > stock → `400`
