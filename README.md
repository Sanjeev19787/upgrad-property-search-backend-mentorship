# Property Search Backend API

**Coursework:** upGrad Backend Development  
**Student:** Sai Sanjeev Pilli

## 1. Project Overview

This project implements a REST API for a property-search application using:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing
- Multer image uploads
- express-validator input validation

The backend supports user authentication, property CRUD, property images, user search preferences, and a preference/budget-based property search algorithm.

## 2. Project Structure

```text
property-backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── propertyController.js
│   └── preferenceController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── uploadMiddleware.js
├── models/
│   ├── User.js
│   ├── Property.js
│   └── Preference.js
├── routes/
│   ├── authRoutes.js
│   ├── propertyRoutes.js
│   └── preferenceRoutes.js
├── uploads/
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── README.md
```

## 3. Installation

Install Node.js LTS first.

Then:

```bash
npm install
```

Create `.env` from `.env.example` and add your MongoDB Atlas connection string and JWT secret.

Start the server:

```bash
npm start
```

For development:

```bash
npm run dev
```

Server URL:

```text
http://localhost:5000
```

## 4. Authentication

Passwords are hashed with bcryptjs. Successful signup/login returns a JWT.

For protected endpoints use:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

Logout is implemented as a stateless JWT logout response. The client must remove its stored token. A server-side token blacklist can be added for stricter session revocation.

## 5. Property Search

The search API supports:

- Minimum budget
- Maximum budget
- Interior preference
- Property type
- City/area
- Minimum bedrooms
- Amenities
- Price ascending/descending
- Bedroom sorting
- Relevance ranking

Example:

```text
GET /api/properties/search?minBudget=2000000&maxBudget=5000000&interior=Furnished&location=Hyderabad&minBedrooms=2&sortBy=relevance
```

The endpoint first applies MongoDB filters and then calculates a relevance score. Matching interior preferences receive high weight, followed by budget, location, property type and bedroom requirements.

## 6. Image Upload

Use:

```text
POST /api/properties/:id/images
```

Content-Type:

```text
multipart/form-data
```

Field name:

```text
images
```

Maximum 10 images per request and 5 MB per image. Supported formats: JPG, JPEG, PNG and WEBP.

## 7. Important API Responses

Successful responses use:

```json
{
  "success": true,
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

## 8. GitHub

Do not upload `.env` or `node_modules`.

Commands:

```bash
git init
git add .
git commit -m "Complete property search backend"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 9. Testing

Recommended tools:

- Postman
- MongoDB Atlas
- VS Code

Suggested testing order:

1. Signup
2. Login
3. Copy JWT
4. Create property
5. Upload property images
6. Get/update/delete property
7. Save user preferences
8. Search properties using budget/interior/location filters
9. Test invalid token and invalid input
10. Test 404 routes
