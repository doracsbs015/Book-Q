
const Message = require('../models/Message');
const mongoose = require('mongoose');

const getRoomId = (a, b) => [a, b].sort().join('_');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // User joins their personal room to receive notifications
    socket.on('join', ({ userId }) => {
      socket.join(userId);
      socket.userId = userId;
      console.log(`👤 ${userId} joined their room`);
    });

    // Join a chat room + mark messages as read + send history
    socket.on('join_chat', async ({ userId, otherUserId }) => {
      const roomId = getRoomId(userId, otherUserId);
      socket.join(roomId);

      // Mark all messages sent TO this user in this room as read
      await Message.updateMany(
        { roomId, to: userId, read: false },
        { $set: { read: true } }
      );

      // Notify the sender their messages were read
      io.to(otherUserId).emit('messages_read', { roomId });

      // Send full chat history
      const history = await Message.find({ roomId }).sort({ time: 1 }).lean();
      socket.emit('chat_history', history);

      // Send updated unread counts to this user
      const unreadCounts = await getUnreadCounts(userId);
      socket.emit('unread_counts', unreadCounts);
    });

    // Send a message
    socket.on('send_message', async ({ fromId, fromName, toId, text }) => {
      const roomId = getRoomId(fromId, toId);

      const msg = await Message.create({
        roomId,
        from: fromId,
        fromName,
        to: toId,
        text,
        read: false,
        time: new Date()
      });

      const msgObj = {
        _id: msg._id,
        roomId,
        from: fromId,
        fromName,
        to: toId,
        text,
        read: false,
        time: msg.time.toISOString()
      };

      // Emit to everyone in the room (both users if both have chat open)
      io.to(roomId).emit('receive_message', msgObj);

      // Also emit updated unread count to recipient's personal room
      const unreadCounts = await getUnreadCounts(toId);
      io.to(toId).emit('unread_counts', unreadCounts);
    });

    // User requests their unread counts (on dashboard load)
    socket.on('get_unread_counts', async ({ userId }) => {
      const unreadCounts = await getUnreadCounts(userId);
      socket.emit('unread_counts', unreadCounts);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};

// Returns { [senderId]: count } for all unread messages for a user
async function getUnreadCounts(userId) {
  const unread = await Message.aggregate([
    { $match: { to: new mongoose.Types.ObjectId(userId), read: false } },
    { $group: { _id: '$from', count: { $sum: 1 } } }
  ]);
  const counts = {};
  unread.forEach(u => { counts[u._id.toString()] = u.count; });
  return counts;

}