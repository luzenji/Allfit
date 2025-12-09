const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const BodyMetrics = require('../models/BodyMetrics');
const Appointment = require('../models/Appointment');
const { auth, isAdminOrCoach } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard/:userId
// @desc    Get user dashboard analytics
// @access  Private
router.get('/dashboard/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (req.user.role === 'client' && userId !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Workout statistics
    const totalWorkouts = await Workout.countDocuments({ userId });
    const recentWorkouts = await Workout.find({ 
      userId, 
      date: { $gte: thirtyDaysAgo } 
    });

    const completedWorkouts = recentWorkouts.filter(w => w.completed).length;
    const totalCaloriesBurned = recentWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalDuration = recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    // Body metrics
    const latestMetrics = await BodyMetrics.findOne({ userId }).sort({ date: -1 });
    const metricsHistory = await BodyMetrics.find({ userId }).sort({ date: -1 }).limit(10);

    // Upcoming appointments
    const upcomingAppointments = await Appointment.find({
      clientId: userId,
      appointmentDate: { $gte: new Date() },
      status: 'scheduled'
    })
    .populate('coachId', 'firstName lastName')
    .sort({ appointmentDate: 1 })
    .limit(5);

    res.json({
      success: true,
      analytics: {
        workouts: {
          total: totalWorkouts,
          recentCount: recentWorkouts.length,
          completedCount: completedWorkouts,
          completionRate: recentWorkouts.length > 0 
            ? Math.round((completedWorkouts / recentWorkouts.length) * 100) 
            : 0,
          totalCaloriesBurned,
          totalDuration
        },
        bodyMetrics: {
          latest: latestMetrics,
          history: metricsHistory
        },
        appointments: {
          upcoming: upcomingAppointments
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/progress/:userId
// @desc    Get user progress data
// @access  Private
router.get('/progress/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Check permissions
    if (req.user.role === 'client' && userId !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    // Get body metrics over time
    const bodyMetrics = await BodyMetrics.find({ 
      userId, 
      ...dateQuery 
    }).sort({ date: 1 });

    // Get workout data over time
    const workouts = await Workout.find({ 
      userId, 
      ...dateQuery 
    }).sort({ date: 1 });

    // Calculate weekly progress
    const weeklyData = {};
    workouts.forEach(workout => {
      const weekKey = new Date(workout.date).toISOString().split('T')[0];
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          date: weekKey,
          workouts: 0,
          duration: 0,
          calories: 0
        };
      }
      weeklyData[weekKey].workouts++;
      weeklyData[weekKey].duration += workout.duration || 0;
      weeklyData[weekKey].calories += workout.caloriesBurned || 0;
    });

    res.json({
      success: true,
      progress: {
        bodyMetrics,
        workouts,
        weeklyData: Object.values(weeklyData)
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/analytics/body-metrics
// @desc    Add body metrics entry
// @access  Private
router.post('/body-metrics', auth, async (req, res) => {
  try {
    const { userId, date, weight, bodyFat, muscleMass, measurements, photos, notes } = req.body;

    // Validation
    if (!weight) {
      return res.status(400).json({ error: 'Weight is required' });
    }

    // Determine userId
    let metricsUserId = userId;
    if (req.user.role === 'client') {
      metricsUserId = req.userId;
    } else if (!userId) {
      return res.status(400).json({ error: 'Please specify userId' });
    }

    // Calculate BMI if height is available
    const User = require('../models/User');
    const user = await User.findById(metricsUserId);
    let bmi = null;
    if (user && user.height) {
      bmi = weight / Math.pow(user.height / 100, 2);
      bmi = Math.round(bmi * 10) / 10;
    }

    const bodyMetrics = new BodyMetrics({
      userId: metricsUserId,
      date: date || Date.now(),
      weight,
      bodyFat,
      muscleMass,
      bmi,
      measurements,
      photos,
      notes,
      recordedBy: req.userId
    });

    await bodyMetrics.save();

    res.status(201).json({
      success: true,
      message: 'Body metrics recorded successfully',
      bodyMetrics
    });
  } catch (error) {
    console.error('Add body metrics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/body-metrics/:userId
// @desc    Get body metrics history
// @access  Private
router.get('/body-metrics/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    // Check permissions
    if (req.user.role === 'client' && userId !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const metrics = await BodyMetrics.find({ userId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('recordedBy', 'firstName lastName');

    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Get body metrics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
