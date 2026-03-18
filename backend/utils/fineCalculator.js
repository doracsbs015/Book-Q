const Transaction = require('../models/Transaction');

const calculateFines = async () => {
  try {
    const now = new Date();
    const overdueTransactions = await Transaction.find({
      status: 'active',
      dueDate: { $lt: now }
    });

    const finePerDay = parseInt(process.env.FINE_PER_DAY) || 5;

    for (const t of overdueTransactions) {
      const daysLate = Math.ceil((now - t.dueDate) / (1000 * 60 * 60 * 24));
      t.fineAmount = daysLate * finePerDay;
      t.status = 'overdue';
      await t.save();
    }
    console.log(`✅ Fines updated for ${overdueTransactions.length} transactions`);
  } catch (err) {
    console.error('❌ Fine calculation error:', err);
  }
};

module.exports = { calculateFines };
