# PH Car Wash System — Backend API

Lightweight, high-performance REST API backend for the PH Car Wash platform, built with **Express 5** and the **native MongoDB driver** in modern JavaScript (ESM).

---

## 🚀 Features

- **Express 5 Native Async Routing:** Async route errors are automatically forwarded to centralized error handling middleware.
- **MongoDB Connection Management:** Pings the database on startup and terminates gracefully on `SIGINT` / `SIGTERM`.
- **Standardized API Responses:**
  - Success: `{ success: true, message: "...", data: ... }`
  - Error: `{ success: false, message: "..." }`
- **Services Management:**
  - Create services with strict field validation (name, canonical branches, positive price, duration, key features, and image URL).
  - Search and filter services by `branch`, `createdBy`, or `name`.
  - Detailed single-service lookup by MongoDB `ObjectId` with early `404` validation.
- **Security & Data Integrity:**
  - CORS restricted to the frontend client origin (`CLIENT_URL`).
  - Strict type checking on query parameters to prevent NoSQL operator injection.
  - JSON parse error interceptor returning clean HTTP `400` errors.

---

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules: `"type": "module"`)
- **Web Framework:** [Express 5.3](https://expressjs.com/)
- **Database Driver:** [MongoDB Node.js Driver 7.8](https://www.mongodb.com/docs/drivers/node/current/)
- **Cross-Origin Handling:** `cors`
- **Environment Management:** `dotenv`

---

## 📋 Prerequisites

- **Node.js:** v20.x or higher
- **MongoDB:** MongoDB Atlas connection string or local MongoDB instance (database name: `ph-car-wash-system`)

---

## ⚙️ Environment Variables

Create a `.env` file in the `car-wash-system-server` directory by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your environment settings:

```env
# Port the API listens on (default: 5000)
PORT=5000

# MongoDB connection string (required)
DB_URI=mongodb+srv://<username>:<password>@<cluster-host>/ph-car-wash-system?retryWrites=true&w=majority

# Frontend origin allowed by CORS (default: http://localhost:3000)
CLIENT_URL=http://localhost:3000
```

> **Note:** The server verifies `DB_URI` at startup and will exit with code `1` if the database is unreachable or the variable is omitted.

---

## 🏃 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server (with watch mode)
```bash
npm run dev
```

### 3. Run the production server
```bash
npm start
```

The API will listen at [http://localhost:5000](http://localhost:5000).

---

## 📡 API Endpoints

### 1. Health Check
| Method | Endpoint | Description | Response Status |
|---|---|---|---|
| `GET` | `/test` | Health verification and status check | `200 OK` |

### 2. Services (`/services`)
| Method | Endpoint | Description | Response Status |
|---|---|---|---|
| `GET` | `/services` | Fetch all services. Supports query filters: `?branch=`, `?createdBy=`, `?name=` | `200 OK` |
| `GET` | `/services/:id` | Fetch a single service by its 24-character hexadecimal MongoDB `ObjectId` | `200 OK` / `404 Not Found` |
| `POST` | `/services` | Create a new service with validated fields | `201 Created` / `400 Bad Request` |

#### `POST /services` Request Body Schema:
```json
{
  "name": "Super Foam & Polish",
  "branch": "Dhaka",
  "description": "Full exterior foaming and interior detailing with protective polish.",
  "image": "https://example.com/images/foam-wash.jpg",
  "price": 850,
  "duration": 45,
  "keyFeatures": [
    "Snow foam exterior hand wash",
    "Underbody rinse",
    "Dashboard wipe & vacuum"
  ],
  "slot": "Morning (9:00 AM - 11:00 AM)",
  "createdBy": "user_id_from_verified_session"
}
```

*Allowed branches:* `"Dhaka"`, `"Chittagong"`, `"Khulna"`, `"Sylhet"`.

### 3. Users (`/users`)
| Method | Endpoint | Description | Response Status |
|---|---|---|---|
| `GET` | `/users/get-all` | Placeholder for Phase 5 Admin user management | `200 OK` |

### 4. Bookings (`/bookings`)
- Router mounted at `/bookings` (Scheduled for Phase 3).

---

## 📂 Project Structure

```
car-wash-system-server/
├── scripts/
│   └── backfill-branch-managers.js   # Script to backfill branch assignments
├── src/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection, collections, ping
│   │   └── env.js                    # Environment validation and exports
│   ├── constants/
│   │   └── branches.js               # Canonical branch list constant
│   ├── middleware/
│   │   ├── errorHandler.js           # Centralized JSON error response handler
│   │   └── notFound.js               # 404 handler for unrecognized routes
│   ├── routes/
│   │   ├── bookings/                 # Bookings router module
│   │   ├── services/                 # Services router module (GET, POST, :id)
│   │   ├── users/                    # Users router module
│   │   └── index.js                  # Master route aggregator
│   ├── utils/
│   │   ├── ApiError.js               # HTTP status-aware custom error class
│   │   └── apiResponse.js            # Standardized sendSuccess response helper
│   ├── app.js                        # Express application configuration & middleware
│   └── index.js                      # Startup listener and graceful shutdown
├── .env.example
├── package.json
└── package-lock.json
```
