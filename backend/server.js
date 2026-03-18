const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/users', require('./routes/users'));

// Cron Job: Calculate fines daily at midnight
// cron.schedule('0 0 * * *', async () => {
//   console.log(' Running daily fine calculation...');
//   const { calculateFines } = require('./utils/fineCalculator');
//   await calculateFines();
// });
cron.schedule('* * * * *', async () => {
  const { calculateFines } = require('./utils/fineCalculator');
  await calculateFines();
});

app.get('/', (req, res) => res.json({ message: 'Digital Library API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
