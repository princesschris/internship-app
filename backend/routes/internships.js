// routes/internships.js
const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ─── Helper: auto-expire internships past their deadline ─────────────────────
// Call this before listing internships so stale ones are marked expired.
// In production you'd run this as a cron job instead (e.g. with node-cron).
async function expireStaleInternships() {
  try {
    const now = new Date();
    const result = await Internship.updateMany(
      {
        status: 'active',
        applicationDeadline: { $lt: now },
      },
      { $set: { status: 'expired', updatedAt: now } }
    );
    if (result.modifiedCount > 0) {
      console.log(`⏰ Auto-expired ${result.modifiedCount} internship(s)`);
    }
  } catch (err) {
    console.error('Auto-expire error:', err);
  }
}

// ─── GET all internships ──────────────────────────────────────────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Expire any stale listings before returning results
    await expireStaleInternships();

    const { state, types, status = 'active' } = req.query;
    let query = { status };

    // Organizations only see their own internships
    // Use $or to match whether organizationId was stored as ObjectId or string
    if (req.user.role === 'Organization') {
      const orgId = req.userId.toString();
      query.$or = [
        { organizationId: req.userId },
        { organizationId: orgId },
      ];
    }

    if (state && state !== 'All') {
      query.state = state;
    }

    if (types) {
      const typesArray = types.split(',');
      query.types = { $in: typesArray };
    }

    const internships = await Internship.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ internships });
  } catch (error) {
    console.error('Get internships error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch internships', status: 500 }
    });
  }
});

// ─── GET single internship ────────────────────────────────────────────────────
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        error: { message: 'Internship not found', status: 404 }
      });
    }

    // Check and update expired status on the fly
    if (
      internship.status === 'active' &&
      internship.applicationDeadline &&
      new Date(internship.applicationDeadline) < new Date()
    ) {
      internship.status = 'expired';
      internship.updatedAt = new Date();
      await internship.save();
    }

    res.status(200).json({ internship });
  } catch (error) {
    console.error('Get internship error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch internship', status: 500 }
    });
  }
});

// ─── POST create internship (Organizations only) ──────────────────────────────
router.post('/', authenticateToken, requireRole(['Organization']), async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      duration,
      state,
      localGovernment,
      types,
      startDate,
      applicationDeadline,
    } = req.body;

    if (!title || !description || !state || !localGovernment || !types || types.length === 0) {
      return res.status(400).json({
        error: { message: 'Missing required fields', status: 400 }
      });
    }

    if (!startDate) {
      return res.status(400).json({
        error: { message: 'Start date is required', status: 400 }
      });
    }

    if (!applicationDeadline) {
      return res.status(400).json({
        error: { message: 'Application deadline is required', status: 400 }
      });
    }

    const deadlineDate = new Date(applicationDeadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        error: { message: 'Application deadline must be in the future', status: 400 }
      });
    }

    const internship = new Internship({
      title,
      description,
      requirements: requirements || '',
      duration: duration || '',
      state,
      localGovernment,
      types,
      startDate: new Date(startDate),
      applicationDeadline: deadlineDate,
      organizationId: req.userId,
      organizationName: req.user.organizationName,
      status: 'active',
    });

    await internship.save();

    console.log('✅ Internship created:', internship._id);
    res.status(201).json({
      message: 'Internship created successfully',
      internship,
    });
  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({
      error: { message: 'Failed to create internship', status: 500 }
    });
  }
});

// ─── PUT update internship (Organizations only, own listings) ─────────────────
router.put('/:id', authenticateToken, requireRole(['Organization']), async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        error: { message: 'Internship not found', status: 404 }
      });
    }

    if (internship.organizationId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: { message: 'Not authorized to update this internship', status: 403 }
      });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.organizationId;
    delete updates.organizationName;
    delete updates.createdAt;
    updates.updatedAt = new Date();

    // Validate new deadline if provided
    if (updates.applicationDeadline) {
      const newDeadline = new Date(updates.applicationDeadline);
      if (newDeadline <= new Date()) {
        return res.status(400).json({
          error: { message: 'Application deadline must be in the future', status: 400 }
        });
      }
      updates.applicationDeadline = newDeadline;
      // Re-activate if it was expired and now has a future deadline
      if (internship.status === 'expired') {
        updates.status = 'active';
      }
    }

    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }

    const updated = await Internship.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Internship updated successfully',
      internship: updated,
    });
  } catch (error) {
    console.error('Update internship error:', error);
    res.status(500).json({
      error: { message: 'Failed to update internship', status: 500 }
    });
  }
});

// ─── DELETE internship (Organizations only, own listings) ─────────────────────
router.delete('/:id', authenticateToken, requireRole(['Organization']), async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        error: { message: 'Internship not found', status: 404 }
      });
    }

    if (internship.organizationId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: { message: 'Not authorized to delete this internship', status: 403 }
      });
    }

    await Internship.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Internship deleted successfully' });
  } catch (error) {
    console.error('Delete internship error:', error);
    res.status(500).json({
      error: { message: 'Failed to delete internship', status: 500 }
    });
  }
});

module.exports = router;