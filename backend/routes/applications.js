const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { internshipId } = req.query;
    let query = {};
    
    if (req.user.role === 'Student') {
      query.studentId = req.userId;
    } else if (req.user.role === 'Organization') {
      query.organizationId = req.userId;
    }
    
    if (internshipId) {
      query.internshipId = internshipId;
    }
    
    const applications = await Application.find(query)
      .sort({ appliedAt: -1 })
      .lean();
    
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch applications', status: 500 } 
    });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ 
        error: { message: 'Application not found', status: 404 } 
      });
    }
    
    if (application.studentId.toString() !== req.userId.toString() && 
        application.organizationId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: { message: 'Not authorized to view this application', status: 403 } 
      });
    }
    
    res.status(200).json({ application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch application', status: 500 } 
    });
  }
});

router.post('/', authenticateToken, requireRole(['Student']), async (req, res) => {
  try {
    const { internshipId } = req.body;
    
    if (!internshipId) {
      return res.status(400).json({ 
        error: { message: 'Internship ID is required', status: 400 } 
      });
    }
    
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ 
        error: { message: 'Internship not found', status: 404 } 
      });
    }
    
    const existingApp = await Application.findOne({
      internshipId,
      studentId: req.userId
    });
    
    if (existingApp) {
      return res.status(400).json({ 
        error: { message: 'Already applied to this internship', status: 400 } 
      });
    }
    
    const application = new Application({
      internshipId,
      internshipTitle: internship.title,
      organizationId: internship.organizationId,
      organizationName: internship.organizationName,
      studentId: req.userId,
      studentName: req.user.fullName,
      studentEmail: req.user.email,
      status: 'pending'
    });
    
    await application.save();
    
    console.log('Application created:', application._id);
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to submit application', status: 500 } 
    });
  }
});

router.patch('/:id/status', authenticateToken, requireRole(['Organization']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'waitlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: { message: 'Invalid status', status: 400 } 
      });
    }
    
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ 
        error: { message: 'Application not found', status: 404 } 
      });
    }
    
    if (application.organizationId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: { message: 'Not authorized to update this application', status: 403 } 
      });
    }
    
    application.status = status;
    application.updatedAt = new Date();
    await application.save();
    
    console.log('Application status updated:', application._id, status);
    
    res.status(200).json({
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update application', status: 500 } 
    });
  }
});

router.delete('/:id', authenticateToken, requireRole(['Student']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ 
        error: { message: 'Application not found', status: 404 } 
      });
    }
    
    if (application.studentId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: { message: 'Not authorized to delete this application', status: 403 } 
      });
    }
    
    await Application.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: 'Application withdrawn successfully' 
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to withdraw application', status: 500 } 
    });
  }
});

module.exports = router;