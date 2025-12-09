const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, isAdminOrCoach, isCoach } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (Admin/Coach only)
// @access  Private
router.get('/', auth, isAdminOrCoach, async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow users to view their own profile or admin/coach to view any
    if (req.userId.toString() !== user._id.toString() && 
        req.user.role !== 'admin' && req.user.role !== 'coach') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users
// @desc    Create new user (Admin/Coach only)
// @access  Private
router.post('/', auth, isAdminOrCoach, async (req, res) => {
  try {
    const { 
      firstName, lastName, email, password, phone, 
      role, dateOfBirth, gender, height, weight, goals, medicalNotes 
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Only coach can create admin or coach accounts
    if ((role === 'admin' || role === 'coach') && req.user.role !== 'coach') {
      return res.status(403).json({ error: 'Only coach can create admin/coach accounts' });
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      role: role || 'client',
      dateOfBirth,
      gender,
      height,
      weight,
      goals,
      medicalNotes,
      createdBy: req.userId
    });

    await user.save();

    const userResponse = await User.findById(user._id).select('-password');
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user: userResponse 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    const isSelfUpdate = req.userId.toString() === user._id.toString();
    const isAdminCoach = req.user.role === 'admin' || req.user.role === 'coach';

    if (!isSelfUpdate && !isAdminCoach) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fields that can be updated
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'profileImage', 
                            'dateOfBirth', 'gender', 'height', 'weight', 'goals', 'medicalNotes'];
    
    // Only admin/coach can update role and isActive
    if (isAdminCoach) {
      allowedUpdates.push('role', 'isActive');
    }

    // Update fields
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    user.updatedAt = Date.now();
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ 
      success: true, 
      message: 'User updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Coach only)
// @access  Private
router.delete('/:id', auth, isCoach, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
