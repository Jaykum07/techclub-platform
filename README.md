# 🚀 CodeNexus — Tech Club Management Platform

A full-stack MERN application for managing a college tech club —
built with production-level architecture, OWASP security standards,
and real-world engineering practices.

---

## 🌐 Live Demo
> Coming soon after deployment

---

## 📌 Project Overview

CodeNexus is a complete club management platform that handles:

- **Public Website** — club info, leaders, achievements, events, FAQs
- **Member Portal** — dashboard, resources, tests, analytics
- **Admin Panel** — manage members, events, tests, join requests
- **Assessment Engine** — integrity-monitored tests with violation tracking

---

## 👥 User Roles

| Role | Access |
|------|--------|
| Public | View club info, submit join request |
| Member | Dashboard, resources, take tests |
| Core Team | Create events/tests, manage members |
| Admin | Full system access, role management |

---

## 🛠️ Tech Stack

**Frontend**
- React 18
- React Router v6
- Context API
- Axios
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

**Security**
- OWASP Top 10 2026 guidelines followed
- Helmet.js
- express-rate-limit
- Input validation — express-validator
- Role-based access control (RBAC)

---

## 📁 Folder Structure
techclub-platform/

├── client/                 # React frontend

│   └── src/

│       ├── components/     # reusable UI components

│       ├── pages/          # route-level pages

│       ├── hooks/          # custom React hooks

│       ├── context/        # global state

│       ├── services/       # API call functions

│       └── routes/         # protected route wrappers

│

└── server/                 # Express backend

└── src/

├── config/         # database, environment

├── controllers/    # HTTP request handlers

├── services/       # business logic

├── models/         # Mongoose schemas

├── routes/         # API route definitions

├── middleware/      # auth, role, error handlers

├── validators/      # input validation rules

└── utils/          # helper functions

---

## 🗄️ Database Models

| Model | Purpose |
|-------|---------|
| User | Authentication, profiles, roles |
| Event | Club events management |
| Test | Assessment engine |
| Submission | Test attempts + integrity tracking |
| ClubProfile | Public page — singleton pattern |
| Leader | Yearly leaders with history |
| Achievement | Club achievements |
| FAQ | Public page FAQs |
| JoinRequest | Member onboarding pipeline |

---

## 🔐 Security Implementation

- Passwords hashed with bcrypt (cost factor 12)
- JWT with expiry + token invalidation on password change
- Role-based middleware on every protected route
- Rate limiting on auth endpoints
- select:false on sensitive fields
- NoSQL injection prevention via Mongoose strict schemas
- CORS configured for specific origins only
- HTTP security headers via Helmet.js

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/techclub-platform.git
cd techclub-platform

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Setup

```bash
# In server folder, create .env file
cp .env.example .env
# Fill in your values
```

### Run Development Server

```bash
# Backend (from server folder)
npm run dev

# Frontend (from client folder)
npm run dev
```

---

## 📈 Development Progress

- [x] System architecture design
- [x] Database schema design (9 models)
- [ ] Express server setup
- [ ] Authentication system
- [ ] Member portal
- [ ] Admin panel
- [ ] Assessment engine
- [ ] Frontend — React setup
- [ ] Deployment

---

## 🎯 Key Engineering Decisions

**Why MongoDB?**
Flexible schema suits club data — events, tests, and member profiles
have varying structures. Embedded documents for bounded data,
references for unbounded collections.

**Why JWT over Sessions?**
Stateless authentication scales better. No server-side session store needed.
Refresh token pattern handles security without sacrificing UX.

**Why separate Controller and Service layers?**
Controllers handle HTTP only. Services hold business logic.
This separation makes testing easier and keeps code maintainable.

---

## 👨‍💻 Author

**Jay Kumrawat**
- GitHub: [@jaykum07](https://github.com/jaykum07)
- LinkedIn: [jayk07](https://linkedin.com/in/jayk07)

---

## 📄 License
MIT