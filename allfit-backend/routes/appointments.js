const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { auth, isAdminOrCoach } = require('../middleware/auth');

// @route   GET /api/appointments
// @desc    Get appointments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, status, clientId, coachId } = req.query;
    let query = {};

    // Filter based on role
    if (req.user.role === 'client') {
      query.clientId = req.userId;
    } else {
      if (clientId) query.clientId = clientId;
      if (coachId) query.coachId = coachId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('clientId', 'firstName lastName email phone')
      .populate('coachId', 'firstName lastName email')
      .sort({ appointmentDate: 1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('clientId', 'firstName lastName email phone')
      .populate('coachId', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions
    const isClient = appointment.clientId._id.toString() === req.userId.toString();
    const isCoach = appointment.coachId._id.toString() === req.userId.toString();
    const isAdminCoach = req.user.role === 'admin' || req.user.role === 'coach';

    if (!isClient && !isCoach && !isAdminCoach) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { clientId, coachId, title, description, appointmentDate, duration, type, notes } = req.body;

    // Validation
    if (!clientId || !coachId || !title || !appointmentDate) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Clients can only book for themselves
    if (req.user.role === 'client' && clientId !== req.userId.toString()) {
      return res.status(403).json({ error: 'You can only book appointments for yourself' });
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      coachId,
      appointmentDate: {
        $gte: new Date(appointmentDate),
        $lt: new Date(new Date(appointmentDate).getTime() + (duration || 60) * 60000)
      },
      status: { $nin: ['cancelled', 'no-show'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const appointment = new Appointment({
      clientId,
      coachId,
      title,
      description,
      appointmentDate: new Date(appointmentDate),
      duration: duration || 60,
      type: type || 'consultation',
      notes
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('clientId', 'firstName lastName email phone')
      .populate('coachId', 'firstName lastName email');

    res.status(201).json({ 
      success: true, 
      message: 'Appointment created successfully',
      appointment: populatedAppointment 
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions
    const isClient = appointment.clientId.toString() === req.userId.toString();
    const isAdminCoach = req.user.role === 'admin' || req.user.role === 'coach';

    if (!isClient && !isAdminCoach) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Clients can only update notes
    const allowedUpdates = isAdminCoach 
      ? ['title', 'description', 'appointmentDate', 'duration', 'type', 'status', 'notes', 'consultationResults']
      : ['notes'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        appointment[field] = req.body[field];
      }
    });

    appointment.updatedAt = Date.now();
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('clientId', 'firstName lastName email phone')
      .populate('coachId', 'firstName lastName email');

    res.json({ 
      success: true, 
      message: 'Appointment updated successfully',
      appointment: updatedAppointment 
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', auth, isAdminOrCoach, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
