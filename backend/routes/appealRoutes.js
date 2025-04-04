const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();
const Appeal = require('../models/Appeal');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Assignment = require('../models/Assignment');

const JWT_SECRET = "your_secret_key"; // Replace with a secure key

// ✅ Middleware to Verify JWT Token
const verifyToken = (req) => {
    const token = req.header("Authorization");
    if (!token) {
        console.error("🚨 No token provided in request headers.");
        return { error: "Access denied. No token provided." };
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        return { user: decoded };
    } catch (error) {
        console.error("🚨 Invalid token.");
        return { error: "Invalid token." };
    }
};

// 📌 **Submit an Appeal (Students Only)**
router.post('/', async (req, res) => {
    try {
        const { assignmentTitle, explanation, evidence } = req.body;
        const { user, error } = verifyToken(req);
        if (error) return res.status(401).json({ message: error });
        if (user.role !== "student") return res.status(403).json({ message: "Access denied." });

        const studentID = user.id;
        if (!studentID || !assignmentTitle || !explanation) {
            return res.status(400).json({ message: "Student ID, assignment title, and explanation are required." });
        }

        const student = await Student.findById(studentID);
        if (!student) return res.status(404).json({ message: "Student not found." });

        const assignment = await Assignment.findOne({ title: assignmentTitle });
        if (!assignment) return res.status(404).json({ message: "Assignment not found." });

        // ✅ Fetch teacher using `teacherName`
        const teacher = await Teacher.findOne({ name: assignment.teacherName });
        if (!teacher) return res.status(404).json({ message: "Teacher not found for this assignment." });

        const appeal = new Appeal({
            studentId: student._id,
            assignmentTitle,
            explanation,
            evidence,
            status: 'Pending'
        });

        await appeal.save();
        console.log("✅ Appeal submitted successfully:", appeal._id);

        // ✅ Create Notification with studentID & assignmentID
        await Notification.create({
            userId: teacher._id,
            studentID: student._id,
            assignmentID: assignment._id,
            message: `A new appeal for "${assignmentTitle}" has been submitted.`,
            link: '/teacher/appeals'
        });

        console.log("✅ Notification sent to teacher:", teacher.name);
        res.status(201).json({ message: 'Appeal submitted successfully' });

    } catch (error) {
        console.error("🚨 Error submitting appeal:", error);
        res.status(500).json({ message: 'Error submitting appeal', error: error.message });
    }
});

// 📌 **Fetch Appeals for the Teacher’s Assignments**
router.get('/teacher', async (req, res) => {
    try {
        const { user, error } = verifyToken(req);
        if (error) return res.status(401).json({ message: error });
        if (user.role !== "teacher") return res.status(403).json({ message: "Access denied." });

        if (!user.email) {
            return res.status(400).json({ message: "Invalid token: Email missing." });
        }

        // ✅ Find teacher using their email
        const teacher = await Teacher.findOne({ email: user.email });
        if (!teacher) return res.status(404).json({ message: "Teacher not found." });

        // ✅ Find assignments assigned by this teacher (using `teacherName`)
        const assignments = await Assignment.find({ teacherName: teacher.name });
        if (!assignments.length) {
            return res.status(404).json({ message: "No assignments found for this teacher." });
        }

        const assignmentTitles = assignments.map(a => a.title);

        // Fetch appeals related to those assignments
        const appeals = await Appeal.find({ assignmentTitle: { $in: assignmentTitles } })
            .populate('studentId', 'name email');

        if (!appeals.length) {
            return res.status(404).json({ message: "No appeals found for your assignments." });
        }

        res.status(200).json(appeals);
    } catch (error) {
        console.error("🚨 Error fetching teacher-specific appeals:", error);
        res.status(500).json({ message: 'Error fetching appeals', error: error.message });
    }
});

// 📌 **Update Appeal Status (Teachers Only)**
router.put('/:id', async (req, res) => {
    try {
        const { user, error } = verifyToken(req);
        if (error) return res.status(401).json({ message: error });
        if (user.role !== "teacher") return res.status(403).json({ message: "Access denied." });

        const { status } = req.body;

        // ✅ Ensure status is valid
        if (!['Reviewed', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use 'Reviewed' or 'Rejected'." });
        }

        // ✅ Ensure valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid appeal ID format." });
        }

        const appeal = await Appeal.findById(req.params.id);
        if (!appeal) return res.status(404).json({ message: 'Appeal not found' });

        // ✅ Fetch student & assignment details
        const student = await Student.findById(appeal.studentId);
        const assignment = await Assignment.findOne({ title: appeal.assignmentTitle });

        if (!student) return res.status(404).json({ message: "Student not found." });
        if (!assignment) return res.status(404).json({ message: "Assignment not found." });

        // ✅ Update appeal status
        appeal.status = status;
        await appeal.save();

        console.log(`✅ Appeal ${appeal._id} marked as ${status}`);

        // ✅ Create Notification with required fields
        await Notification.create({
            userId: appeal.studentId,  // ✅ Notify the student
            studentID: student._id,    // ✅ Ensure studentID is included
            assignmentID: assignment._id, // ✅ Ensure assignmentID is included
            message: `Your appeal for assignment "${appeal.assignmentTitle}" has been ${status.toLowerCase()}.`,
            link: '/student/appeals'
        });

        console.log("✅ Notification sent to student:", student.name);
        res.status(200).json({ message: `Appeal marked as ${status.toLowerCase()}` });

    } catch (error) {
        console.error("🚨 Error updating appeal status:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;
