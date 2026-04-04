const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

const books = [
  { title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', description: 'A philosophical novel about a young Andalusian shepherd on a journey to find treasure.', totalCopies: 5, availableCopies: 5, coverColor: '#7c3aed', borrowCount: 42, coverImage: 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Classic', description: 'A novel about racial injustice and moral growth in the American South.', totalCopies: 4, availableCopies: 4, coverColor: '#6d28d9', borrowCount: 38, coverImage: 'https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Non-Fiction', description: 'A brief history of humankind from the Stone Age to the present.', totalCopies: 6, availableCopies: 6, coverColor: '#5b21b6', borrowCount: 55, coverImage: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg' },
  { title: '1984', author: 'George Orwell', category: 'Dystopia', description: 'A terrifying vision of a totalitarian future world.', totalCopies: 3, availableCopies: 3, coverColor: '#4c1d95', borrowCount: 47, coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg' },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', description: 'An easy and proven way to build good habits and break bad ones.', totalCopies: 8, availableCopies: 8, coverColor: '#8b5cf6', borrowCount: 63, coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Classic', description: 'A story of wealth, love, and the American Dream in the 1920s.', totalCopies: 4, availableCopies: 4, coverColor: '#a78bfa', borrowCount: 29, coverImage: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', description: 'A guide to the two systems that drive the way we think.', totalCopies: 5, availableCopies: 5, coverColor: '#7c3aed', borrowCount: 33, coverImage: 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg' },
  { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', category: 'Self-Help', description: 'A counterintuitive approach to living a good life.', totalCopies: 7, availableCopies: 7, coverColor: '#6d28d9', borrowCount: 44, coverImage: 'https://covers.openlibrary.org/b/isbn/9780062457714-L.jpg' },
  { title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction', description: 'An epic saga set in a distant future on a desert planet.', totalCopies: 4, availableCopies: 4, coverColor: '#5b21b6', borrowCount: 36, coverImage: 'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg' },
  { title: 'The Midnight Library', author: 'Matt Haig', category: 'Fiction', description: 'A story about all the choices that go into a life well lived.', totalCopies: 5, availableCopies: 5, coverColor: '#4c1d95', borrowCount: 28, coverImage: 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg' },
  { title: 'Deep Work', author: 'Cal Newport', category: 'Self-Help', description: 'Rules for focused success in a distracted world.', totalCopies: 6, availableCopies: 6, coverColor: '#8b5cf6', borrowCount: 41, coverImage: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg' },
  { title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', category: 'Fantasy', description: 'The beginning of the magical journey of Harry Potter at Hogwarts.', totalCopies: 8, availableCopies: 8, coverColor: '#7c3aed', borrowCount: 72, coverImage: 'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', description: 'Timeless lessons on wealth, greed, and happiness.', totalCopies: 5, availableCopies: 5, coverColor: '#6d28d9', borrowCount: 39, coverImage: 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg' },
  { title: 'Brief History of Time', author: 'Stephen Hawking', category: 'Science', description: 'A landmark work in scientific writing about the cosmos.', totalCopies: 4, availableCopies: 4, coverColor: '#5b21b6', borrowCount: 31, coverImage: 'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg' },
  { title: 'The Lean Startup', author: 'Eric Ries', category: 'Business', description: "How today's entrepreneurs use continuous innovation to create radical success.", totalCopies: 6, availableCopies: 6, coverColor: '#4c1d95', borrowCount: 26, coverImage: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Book.deleteMany({});
  await Transaction.deleteMany({});

  // Create librarian
  const librarianPassword = await bcrypt.hash('librarian123', 12);
  await User.create({
    name: 'Admin Librarian',
    email: 'librarian@library.com',
    password: librarianPassword,
    role: 'librarian'
  });

  // Create sample users
  const userPassword = await bcrypt.hash('user123', 12);
  await User.create({
    name: 'John Doe',
    email: 'user@library.com',
    password: userPassword,
    role: 'user'
  });

  await User.create({
    name: 'Jane Smith',
    email: 'user2@library.com',
    password: userPassword,
    role: 'user'
  });

  await Book.insertMany(books);

  console.log('✅ Seed data inserted!');
  console.log('📧 Librarian: librarian@library.com | Password: librarian123');
  console.log('📧 User 1:    user@library.com      | Password: user123');
  console.log('📧 User 2:    user2@library.com     | Password: user123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });