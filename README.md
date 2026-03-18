# 📚 LibraryOS — Digital Library System

A full-stack MERN application that digitizes a physical library. Built with MongoDB, Express.js, React.js, and Node.js.

---

## 🎨 Features

- **Lilac/Purple gradient theme** — elegant, professional UI
- **JWT Authentication** — secure login for Users and Librarians
- **Book Management** — add, edit, delete, search books
- **Borrow & Return System** — with due dates (14 days)
- **Fine Calculation** — ₹5/day via automated cron job
- **Reservation Queue** — join waitlist when books are unavailable
- **AI Recommendations** — based on borrowing history (no external APIs)
- **People Also Borrowed** — collaborative filtering
- **Trending Books** — most borrowed books
- **Reading History** — track all previously borrowed books
- **Librarian Admin Panel** — manage everything in one place

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **MongoDB** running locally on `mongodb://localhost:27017`
  - Install MongoDB Community: https://www.mongodb.com/try/download/community
  - Or use MongoDB Atlas (update MONGO_URI in backend/.env)

### Step 1 — Install Dependencies

Open **two separate terminals** in VS Code.

**Terminal 1 — Backend:**
```bash
cd backend
npm install
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
```

### Step 2 — Seed Sample Data

In the backend terminal:
```bash
npm run seed
```

This creates:
- 15 sample books
- Librarian account: `librarian@library.com` / `librarian123`
- User account: `user@library.com` / `user123`

### Step 3 — Start the Application

**Terminal 1 — Start Backend (port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Start Frontend (port 3000):**
```bash
cd frontend
npm start
```

### Step 4 — Open in Browser

Visit: **http://localhost:3000**

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 📚 Librarian | librarian@library.com | librarian123 |
| 👤 User | user@library.com | user123 |

---

## 📁 Project Structure

```
digital-library/
├── backend/
│   ├── models/
│   │   ├── User.js         # User schema
│   │   ├── Book.js         # Book schema (with text index)
│   │   └── Transaction.js  # Borrow/return transactions
│   ├── routes/
│   │   ├── auth.js         # Register, login, me
│   │   ├── books.js        # CRUD, search, trending, recommendations
│   │   ├── transactions.js # Borrow, return, history
│   │   └── users.js        # User management
│   ├── middleware/
│   │   └── auth.js         # JWT + role-based middleware
│   ├── utils/
│   │   ├── fineCalculator.js  # Daily cron logic
│   │   └── seed.js            # Sample data seeder
│   ├── .env                # Environment variables
│   └── server.js           # Express app + cron job
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js
│       │   ├── BookCard.js
│       │   └── ProtectedRoute.js
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── ToastContext.js
│       ├── pages/
│       │   ├── Home.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Books.js
│       │   ├── BookDetail.js
│       │   ├── UserDashboard.js
│       │   └── AdminDashboard.js
│       ├── styles/
│       │   └── global.css
│       ├── App.js
│       └── index.js
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Books
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/books | - | Get all books |
| GET | /api/books/search?q= | - | Search books |
| GET | /api/books/trending | - | Top borrowed books |
| GET | /api/books/recommendations | User | Personalized recs |
| GET | /api/books/:id | - | Single book |
| GET | /api/books/:id/also-borrowed | User | Collaborative filter |
| POST | /api/books | Librarian | Add book |
| PUT | /api/books/:id | Librarian | Update book |
| DELETE | /api/books/:id | Librarian | Delete book |
| POST | /api/books/:id/reserve | User | Join queue |

### Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/transactions/borrow | User | Borrow book |
| POST | /api/transactions/return | User | Return book |
| GET | /api/transactions/my | User | My transactions |
| GET | /api/transactions/all | Librarian | All transactions |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/users | Librarian | All users |
| GET | /api/users/reading-history | User | Reading history |

---

## ⚙️ Configuration

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/digital-library
JWT_SECRET=your_super_secret_key
FINE_PER_DAY=5        # Fine in ₹ per day
BORROW_DAYS=14        # Default borrow duration
```

---

## 🤖 AI Features (No External APIs)

1. **Smart Recommendations** — Tracks your borrow history, finds your most-read category, suggests new books in that category
2. **People Also Borrowed** — Finds users who read the same book and recommends what else they read
3. **Trending Books** — Books ranked by total borrow count
4. **Reading History** — Complete log of every book you've borrowed

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Scheduling | node-cron (daily fine calc) |
| Fonts | Playfair Display + DM Sans |

---

Made with 💜 for LibraryOS Hackathon
