// routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');

// Get conversations list
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    }).sort({ timestamp: -1 }).lean();
    
    // Group by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const partnerId = msg.senderId.toString() === userId.toString() 
        ? msg.recipientId.toString() 
        : msg.senderId.toString();
      const partnerName = msg.senderId.toString() === userId.toString() 
        ? msg.recipientName 
        : msg.senderName;
      
      if (!conversationsMap.has(partnerId) || 
          new Date(msg.timestamp) > new Date(conversationsMap.get(partnerId).lastMessageTime)) {
        conversationsMap.set(partnerId, {
          userId: partnerId,
          userName: partnerName,
          lastMessage: msg.text,
          lastMessageTime: msg.timestamp,
          unread: msg.recipientId.toString() === userId.toString() && !msg.read
        });
      }
    });
    
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    
    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch conversations', status: 500 } 
    });
  }
});

// Get messages with a specific user
router.get('/:recipientId', authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.userId;
    
    // Get messages between these two users
    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: recipientId },
        { senderId: recipientId, recipientId: userId }
      ]
    }).sort({ timestamp: 1 }).lean();
    
    // Mark received messages as read
    await Message.updateMany(
      { senderId: recipientId, recipientId: userId, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch messages', status: 500 } 
    });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    
    if (!recipientId || !text || text.trim() === '') {
      return res.status(400).json({ 
        error: { message: 'Recipient ID and message text are required', status: 400 } 
      });
    }
    
    // Get recipient info
    const User = require('../models/User');
    const recipient = await User.findById(recipientId).select('fullName organizationName');
    
    if (!recipient) {
      return res.status(404).json({ 
        error: { message: 'Recipient not found', status: 404 } 
      });
    }
    
    const senderName = req.user.fullName || req.user.organizationName;
    const recipientName = recipient.fullName || recipient.organizationName;
    
    const message = new Message({
      senderId: req.userId,
      senderName,
      recipientId,
      recipientName,
      text: text.trim(),
      read: false
    });
    
    await message.save();
    // console.log('Message sent:', message._id);
    
    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to send message', status: 500 } 
    });
  }
});

router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ 
        error: { message: 'Message not found', status: 404 } 
      });
    }
    
    if (message.recipientId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: { message: 'Not authorized', status: 403 } 
      });
    }
    
    message.read = true;
    await message.save();
    
    res.status(200).json({ 
      message: 'Message marked as read' 
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to mark message as read', status: 500 } 
    });
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ 
        error: { message: 'Message not found', status: 404 } 
      });
    }
    
    // Only sender can delete
    if (message.senderId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: { message: 'Not authorized to delete this message', status: 403 } 
      });
    }
    
    await Message.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: 'Message deleted successfully' 
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to delete message', status: 500 } 
    });
  }
});

module.exports = router;