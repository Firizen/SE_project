const express = require('express');
const router = express.Router();
const Appeal = require('../models/Appeal');
const Notification = require('../models/Notification');
const { protect, teacherOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Submit an appeal (Students only)
router.post('/', protect, async (req, res) => {
    try {
        const { assignmentTitle, explanation, evidence } = req.body;

        if (!assignmentTitle || !explanation) {
            return res.status(400).json({ message: "Assignment title and explanation are required" });
        }

        const appeal = new Appeal({
            studentId: req.user.id,
            assignmentTitle,
            explanation,
            evidence,
            status: 'Pending'
        });

        await appeal.save();

        // Notify teachers about the new appeal
        const teachers = await User.find({ role: 'teacher' }).select('_id');
        const notifications = teachers.map(teacher => ({
            userId: teacher._id,
            message: `A new appeal for "${assignmentTitle}" has been submitted.`,
            link: '/teacher/appeals'
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({ message: 'Appeal submitted successfully' });
    } catch (error) {
        console.error("Error submitting appeal:", error);
        res.status(500).json({ message: 'Error submitting appeal', error: error.message });
    }
});

// Fetch all appeals (Teachers only)
router.get('/', protect, teacherOnly, async (req, res) => {
    try {
        const appeals = await Appeal.find()
            .populate('studentId', 'name')
            .select('-__v');

        res.status(200).json(appeals);
    } catch (error) {
        console.error("Error fetching appeals:", error);
        res.status(500).json({ message: 'Error fetching appeals', error: error.message });
    }
});

// Update appeal status (Teachers only)
router.put('/:id', protect, teacherOnly, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Reviewed', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use 'Reviewed' or 'Rejected'." });
        }

        const appeal = await Appeal.findById(req.params.id);
        if (!appeal) {
            return res.status(404).json({ message: 'Appeal not found' });
        }

        appeal.status = status;
        await appeal.save();

        // Notify student about the decision
        const notification = new Notification({
            userId: appeal.studentId,
            message: `Your appeal for assignment "${appeal.assignmentTitle}" has been ${status.toLowerCase()}.`,
            link: '/student/appeals'
        });
        await notification.save();

        res.status(200).json({ message: `Appeal marked as ${status.toLowerCase()}` });
    } catch (error) {
        console.error("Error updating appeal status:", error);
        res.status(500).json({ message: 'Error updating appeal status', error: error.message });
    }
});

module.exports = router;
