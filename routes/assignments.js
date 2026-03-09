const express = require('express');
const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// @GET /api/assignments/upcoming — Deadlines in next 7 days
router.get('/upcoming', async (req, res) => {
    try {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const assignments = await Assignment.find({
            user: req.userId,
            completed: false,
            deadline: { $gte: now, $lte: nextWeek }
        })
            .populate('subject', 'name color')
            .sort({ deadline: 1 });

        res.json(assignments);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @GET /api/assignments — Get all assignments
router.get('/', async (req, res) => {
    try {
        const { completed, subjectId } = req.query;
        const filter = { user: req.userId };

        if (completed !== undefined) filter.completed = completed === 'true';
        if (subjectId) filter.subject = subjectId;

        const assignments = await Assignment.find(filter)
            .populate('subject', 'name color')
            .sort({ deadline: 1 });

        res.json(assignments);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @POST /api/assignments — Create assignment
router.post('/', async (req, res) => {
    try {
        const { title, description, subjectId, deadline, priority } = req.body;

        if (!title || !subjectId || !deadline) {
            return res.status(400).json({ message: 'title, subjectId, and deadline are required.' });
        }

        const subject = await Subject.findOne({ _id: subjectId, user: req.userId });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        const assignment = new Assignment({
            title,
            description,
            subject: subjectId,
            user: req.userId,
            deadline: new Date(deadline),
            priority: priority || 'medium'
        });

        await assignment.save();
        await assignment.populate('subject', 'name color');
        res.status(201).json(assignment);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @PUT /api/assignments/:id — Update / toggle complete
router.put('/:id', async (req, res) => {
    try {
        const updates = {};
        const allowed = ['title', 'description', 'deadline', 'priority', 'completed'];
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const assignment = await Assignment.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            updates,
            { returnDocument: 'after' }
        ).populate('subject', 'name color');

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }

        res.json(assignment);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @DELETE /api/assignments/:id — Delete assignment
router.delete('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }
        res.json({ message: 'Assignment deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;
