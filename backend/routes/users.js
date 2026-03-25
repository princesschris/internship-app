// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch user profile', status: 500 } 
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'User not found', status: 404 } 
      });
    }
    
    // Return only public information
    const publicData = {
      _id: user._id,
      role: user.role,
      profileImage: user.profileImage,
      ...(user.role === 'Student' 
        ? { fullName: user.fullName }
        : { organizationName: user.organizationName, state: user.state }
      )
    };
    
    res.status(200).json({ user: publicData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch user', status: 500 } 
    });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.email;
    delete updates.password;
    delete updates.role;
    delete updates.createdAt;
    
    updates.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('✅ Profile updated:', user._id);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update profile', status: 500 } 
    });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: { message: 'Current password and new password are required', status: 400 } 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: { message: 'New password must be at least 6 characters', status: 400 } 
      });
    }
    
    // Get user with password
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: { message: 'User not found', status: 404 } 
      });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ 
        error: { message: 'Current password is incorrect', status: 401 } 
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    console.log('✅ Password changed:', user._id);
    
    res.status(200).json({ 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to change password', status: 500 } 
    });
  }
});

// Delete user account
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    
    res.status(200).json({ 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to delete account', status: 500 } 
    });
  }
});

module.exports = router;