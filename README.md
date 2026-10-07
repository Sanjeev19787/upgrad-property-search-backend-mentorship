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

