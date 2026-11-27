# EventSphere Management

EventSphere is a full-stack expo and trade show management platform built with the MERN stack and Socket.io. It connects event organizers, exhibitors, and attendees around interactive hall floor plans, booth reservations, speaker schedules, QR passes, and real-time messaging.

---

## Core Features

### Role-Based Portals
- **Organizer / Admin (`/admin`)**
  - Analytics dashboard with booth occupancy and session attendance charts.
  - Expo creation with automatic floor plan grid generation (VIP, Premium, and Standard tiers).
  - Booth reservation approval and rejection workflow.
  - Session and speaker schedule management.
  - Real-time exhibitor support inbox and user feedback moderation (including featuring verified reviews on the landing page).
- **Exhibitor (`/exhibitor`)**
  - Interactive floor plan view for selecting and requesting available booths.
  - Product catalog, booth description, and staff roster management.
  - Printable official QR booth invoices (`/verify/invoice/:id`).
  - Company profile and logo upload.
  - Two-way messaging with organizers, attendees, and neighboring booths.
- **Attendee (`/attendee`)**
  - Expo registration and scannable VIP QR entry pass generation (`/verify/pass/:id`).
  - Searchable exhibitor directory, saved booth visit list, and interactive floor map.
  - 1-on-1 appointment requests and live messaging with exhibitors.
  - Speaker schedule browsing and session bookmarking.

### Shared Platform Capabilities
- **Real-Time Communication**: Powered by Socket.io for instant message delivery, seen receipts, online presence status, and live navbar notification alerts.
- **Account & Privacy Controls**: Profile editing, avatar uploads, password updates, light/dark theme toggle, font and text-scale preferences, JSON data export, and permanent account deletion.
- **Public Directory**: Searchable upcoming expos list, detailed expo floor plan & schedule preview (`/expos/:id`), booth package overview (`/services`), FAQs, and public feedback form (`/feedback`).

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router DOM 7, Axios, Socket.io Client, Recharts, Lucide React, `qrcode.react` |
| **Backend** | Node.js, Express 5, Mongoose 9 (MongoDB), Socket.io 4, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Multer |
| **Security** | Helmet, CORS, `express-rate-limit`, Role-Based Access Control (RBAC), per-tab `sessionStorage` JWT |

---

## Project Structure

```text
EventSphere-Management/
├── client/                     # React + Vite frontend
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/         # Navbar, Footer, MessageCenter, AccountSettings, QrDocumentModal, etc.
│   │   ├── context/            # AuthContext (session & user state)
│   │   ├── hooks/              # useDebounce, useSmartAction
│   │   ├── pages/              # Public pages, Auth pages, and Admin/Exhibitor/Attendee dashboards
│   │   ├── services/           # Axios API client & Socket.io client
│   │   ├── App.jsx             # Route definitions with lazy-loaded pages
│   │   └── index.css           # Tailwind CSS v4 config, typography, dark theme & print styles
│   └── vite.config.js          # Vite + Rolldown chunk splitting config
└── server/                     # Express + MongoDB + Socket.io backend
    ├── config/                 # MongoDB connection setup (db.js)
    ├── controllers/            # Route handlers for auth, expos, booths, sessions, messages, system
    ├── middleware/             # JWT auth, RBAC, Multer file upload, error handler
    ├── models/                 # Mongoose schemas (User, Expo, Booth, Session, Message, Feedback)
    ├── routes/                 # Express API route definitions
    ├── uploads/                # Uploaded avatars, company logos, and documents
    ├── utils/                  # JWT token generator
    ├── seed.js                 # Database seeder with multi-role sample data
    └── server.js               # App entry point, HTTP server & Socket.io setup
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (local instance or MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd EventSphere-Management
```

### 2. Configure and Start the Backend (`server`)
```bash
cd server
npm install
```

Create a `.env` file inside `server/` with the following variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/eventsphere
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Seed the database with sample expos, booths, sessions, messages, and demo accounts:
```bash
node seed.js
```

Start the backend server:
```bash
npm run dev
```

### 3. Configure and Start the Frontend (`client`)
Open a new terminal in the project root:
```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and connects to the API and Socket.io server on `http://localhost:5000`.

---

## Demo Accounts (From `server/seed.js`)

| Role | Email | Password |
| --- | --- | --- |
| **Admin (Organizer)** | `admin@eventsphere.com` | `Password123` |
| **Exhibitor (NexaTech)** | `nexatech@eventsphere.com` | `Password123` |
| **Exhibitor (CloudWave)** | `cloudwave@eventsphere.com` | `Password123` |
| **Attendee** | `sara@eventsphere.com` | `Password123` |

---

## API Overview

Base URL: `http://localhost:5000/api`

| Module | Base Path | Key Endpoints |
| --- | --- | --- |
| **Health** | `/api/health` | `GET /` — Server status check |
| **Auth & Profile** | `/api/auth` | `POST /register`, `POST /login`, `POST /google`, `GET /me`, `PUT /profile`, `PUT /password`, `POST /saved-booths/:boothId`, `GET /export-data`, `DELETE /account` |
| **Expos** | `/api/expos` | `GET /`, `POST /` (Admin), `GET /:id`, `PUT /:id` (Admin), `DELETE /:id` (Admin), `POST /:id/register` (Attendee) |
| **Booths** | `/api/booths` | `GET /expo/:expoId`, `POST /:id/reserve` (Exhibitor), `PUT /:id/status` (Admin), `PUT /:id/showcase` (Exhibitor) |
| **Sessions** | `/api/sessions` | `GET /expo/:expoId`, `POST /` (Admin), `PUT /:id` (Admin), `DELETE /:id` (Admin), `POST /:id/bookmark` (Attendee) |
| **Messages** | `/api/messages` | `POST /`, `GET /my`, `PUT /mark-read`, `POST /:id/reply`, `PUT /:id/appointment`, `DELETE /:id`, `DELETE /:id/replies/:replyId` |
| **System & Feedback** | `/api/system` | `GET /analytics` (Admin), `GET /notifications`, `GET /public-reviews`, `POST /feedback`, `GET /feedback` (Admin), `PUT /feedback/:id` (Admin), `PUT /feedback/:id/approve-public` (Admin) |
| **Uploads** | `/api/upload` | `POST /` — Upload JPG, PNG, WebP, or PDF (max 5 MB) |

---

## Available Scripts

### Client (`client/`)
- `npm run dev` — Start Vite development server
- `npm run build` — Build optimized production bundle into `client/dist`
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint across the frontend codebase

### Server (`server/`)
- `npm run dev` — Start Express + Socket.io server with Nodemon
- `npm start` — Start server in production mode with Node
- `node seed.js` — Populate MongoDB with initial demo data
