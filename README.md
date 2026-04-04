# Noolaga Thozhan — ShelfMate

> "ஒரு சிறந்த புத்தகம் நூறு நல்ல நண்பர்களுக்குச் சமம். ஆனால், ஒரு நல்ல நண்பன் ஒரு நூலகத்திற்கே சமம்!"
>
> "One good book is equal to a hundred good friends. But one good friend is equal to a whole library."
>
> — Dr. A.P.J. Abdul Kalam / டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம்

A smart digital library where you don't just borrow books — you find people who read the same ones.

[Live Demo](https://book-q-psi.vercel.app/) · [Demo Video](https://drive.google.com/file/d/15MgIYyF0I6KuhrWxKHnVY5-bhqB3sFhp/view?usp=sharing)

---

## What it does

Most library apps stop at borrow and return. This one goes further.

There are two roles — **user** and **librarian**. Users browse the collection, request books, track their borrows, and get fined automatically if they're late. Librarians handle approvals, rejections, and returns from a dedicated admin panel.

When a book has no copies left, users can join a reservation queue. The moment someone returns it, the next person in line gets auto-assigned — no manual intervention needed.

On top of that, the app tracks what each user borrows and builds a reading profile. That profile powers book recommendations, and also connects users with other readers who share the same taste. They can then chat with each other in real time — messages are stored in MongoDB so nothing disappears on a server restart.

---

## Stack

- **Frontend** — React.js, deployed on Vercel
- **Backend** — Node.js + Express.js, deployed on Render
- **Database** — MongoDB Atlas
- **Auth** — JWT with role-based access (user / librarian)
- **Real-time** — Socket.io
- **Scheduling** — node-cron for automatic fine calculation

---

## Folder Structure
```
backend/
├── server.js
├── models/          — User, Book, Transaction, Message
├── routes/          — auth, books, transactions, users
├── middleware/      — JWT protect, librarian role check
├── socket/          — chatHandler.js (Socket.io logic)
└── utils/           — fineCalculator.js, seed.js

frontend/src/
├── pages/           — Home, Books, BookDetail, Login, Register,
│                      UserDashboard, AdminDashboard
├── components/      — Navbar, BookCard, ChatWindow, ProtectedRoute
├── context/         — AuthContext, ToastContext
└── utils/           — api.js (axios instance), socket.js (socket singleton)
```

---

## Key Features

**Borrow workflow** — user sends a request, librarian approves or rejects it. Copies only reduce on approval, not on request. Prevents overselling when multiple users request the same last copy simultaneously.

**Reservation queue** — when a book has zero copies, users join a queue stored on the Book document. On return, the next user is automatically assigned an active transaction without needing to request again.

**Fine system** — node-cron runs every minute and checks all active transactions. Any book past its due date accumulates ₹5 per minute in demo mode (configurable to per-day for production via `FINE_PER_DAY` env variable).

**Recommendations** — every approved borrow updates the user's `favoriteGenre` field to their most borrowed category. The recommendations route uses this to suggest unread books from that genre. Falls back to trending books if the user has no history yet.

**Reader discovery** — the Connect tab shows all registered users. Those who share your favourite genre are highlighted and sorted to the top. You can search by name or email and open a chat with anyone.

**Real-time chat** — built with Socket.io. Each conversation lives in a unique room keyed by both user IDs. Messages are saved to MongoDB so they persist across server restarts. Unread counts update live via personal socket rooms, and read receipts (single tick / double tick) update when the recipient opens the chat.

**Admin panel** — librarians can add and edit books with cover image URLs, approve or reject borrow requests, process returns, and view all transactions and fines in one place.

---

## Run Locally
```bash
# Backend
cd backend
npm install
# add .env file (see below)
node utils/seed.js    # seeds books and test accounts
npm start

# Frontend
cd frontend
npm install
# add .env file (see below)
npm start
```

## Environment Variables

**Backend `.env`**
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
PORT=5000
FINE_PER_DAY=5
```

**Frontend `.env`**
```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
```

---

Built by [Dhora M](https://github.com/doracsbs015)