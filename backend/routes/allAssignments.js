const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment'); // Your Assignment model


// GET all assignments with teacher details (for Admin)
router.get('/all-with-teachers', async (req, res) => {
    try {
        console.log("🚀 Request received to fetch all assignments with teacher details (Admin)");

        const assignments = await Assignment.find({})
            .populate('teacherName') // Populates the teacher reference
            .sort({ createdAt: -1 }); // Optional: sort by creation date

        console.log(`📊 Found ${assignments.length} assignments.`);

        // Transform data if needed (e.g., ensure teacher name exists)
        const assignmentsWithTeacherNames = assignments.map(assignment => ({
            _id: assignment._id,
            title: assignment.title,
            className: assignment.className, // Include other relevant fields
            createdAt: assignment.createdAt,
            dueDate: assignment.dueDate,
            teacherName: assignment.teacherName
        }));


        res.json(assignmentsWithTeacherNames);

    } catch (err) {
        console.error("❌ Error fetching all assignments for admin:", err);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// ... other assignment routes ...

module.exports = router;