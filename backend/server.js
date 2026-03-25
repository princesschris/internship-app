const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

app.io = io;
const onlineUsers = new Map();

io.on('connection', (socket) => {
  // console.log('Client connected:', socket.id);

  socket.on('join', (userId) => {
    console.log(`User ${userId} joined`);
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    socket.broadcast.emit('user_online', { userId });
  });

  socket.on('typing', ({ recipientId, isTyping, senderId }) => {
    io.to(recipientId).emit('typing_status', {
      userId: senderId,
      isTyping
    });
  });

  socket.on('disconnect', () => {
    // console.log('Client disconnected:', socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        socket.broadcast.emit('user_offline', { userId });
        break;
      }
    }
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/internships', require('./routes/internships'));
app.use('/api/applications', require('./routes/applications')); 
app.use('/api/users', require('./routes/users'));    

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/internship-app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  // console.log(`WebSocket ready`);
});