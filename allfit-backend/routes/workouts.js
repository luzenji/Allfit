const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const { auth, isAdminOrCoach } = require('../middleware/auth');

// @route   GET /api/workouts
// @desc    Get workouts (filtered by user)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    let query = {};

    // If not admin/coach, only show own workouts
    if (req.user.role === 'client') {
      query.userId = req.userId;
    } else if (userId) {
      query.userId = userId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(query)
      .populate('userId', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: -1 });

    res.json({ success: true, workouts });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/workouts/:id
// @desc    Get workout by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('userId', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Check permissions
    if (req.user.role === 'client' && workout.userId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/workouts
// @desc    Create new workout
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { userId, title, description, date, exercises, duration, caloriesBurned, notes, coachNotes } = req.body;

    // Validation
    if (!title || !exercises || exercises.length === 0) {
      return res.status(400).json({ error: 'Please provide title and exercises' });
    }

    // Determine userId
    let workoutUserId = userId;
    if (req.user.role === 'client') {
      // Clients can only create workouts for themselves
      workoutUserId = req.userId;
    } else if (!userId) {
      return res.status(400).json({ error: 'Please specify userId' });
    }

    const workout = new Workout({
      userId: workoutUserId,
      title,
      description,
      date: date || Date.now(),
      exercises,
      duration,
      caloriesBurned,
      notes,
      coachNotes,
      createdBy: req.userId
    });

    await workout.save();

    const populatedWorkout = await Workout.findById(workout._id)
      .populate('userId', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({ 
      success: true, 
      message: 'Workout created successfully',
      workout: populatedWorkout 
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/workouts/:id
// @desc    Update workout
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Check permissions
    const isOwner = workout.userId.toString() === req.userId.toString();
    const isAdminCoach = req.user.role === 'admin' || req.user.role === 'coach';

    if (!isOwner && !isAdminCoach) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update fields
    const allowedUpdates = ['title', 'description', 'date', 'exercises', 'duration', 
                            'caloriesBurned', 'notes', 'completed'];
    
    // Only admin/coach can update coachNotes
    if (isAdminCoach) {
      allowedUpdates.push('coachNotes');
    }

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        workout[field] = req.body[field];
      }
    });

    workout.updatedAt = Date.now();
    await workout.save();

    const updatedWorkout = await Workout.findById(workout._id)
      .populate('userId', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');

    res.json({ 
      success: true, 
      message: 'Workout updated successfully',
      workout: updatedWorkout 
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete workout
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Check permissions
    const isOwner = workout.userId.toString() === req.userId.toString();
    const isAdminCoach = req.user.role === 'admin' || req.user.role === 'coach';

    if (!isOwner && !isAdminCoach) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Workout.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Workout deleted successfully' 
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
