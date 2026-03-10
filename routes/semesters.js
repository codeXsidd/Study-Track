const express = require('express');
const Semester = require('../models/Semester');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0 };

const calcSGPA = (subjects) => {
    const totalCredits = subjects.reduce((a, s) => a + Number(s.credits), 0);
    if (!totalCredits) return 0;
    const weighted = subjects.reduce((a, s) => a + (GRADE_POINTS[s.grade] || 0) * Number(s.credits), 0);
    return parseFloat((weighted / totalCredits).toFixed(2));
};

// GET all semesters
router.get('/', async (req, res) => {
    try {
        const sems = await Semester.find({ user: req.userId }).sort({ semNumber: 1 });
        res.json(sems);
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

// POST/PUT save a semester (upsert)
router.post('/', async (req, res) => {
    try {
        const { semNumber, subjects } = req.body;
        if (!semNumber || !subjects) return res.status(400).json({ message: 'semNumber and subjects required.' });

        const sgpa = calcSGPA(subjects);
        const sem = await Semester.findOneAndUpdate(
            { user: req.userId, semNumber },
            { subjects, sgpa },
            { returnDocument: 'after', upsert: true }
        );
        res.status(201).json(sem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE a semester
router.delete('/:semNumber', async (req, res) => {
    try {
        await Semester.findOneAndDelete({ user: req.userId, semNumber: req.params.semNumber });
        res.json({ message: 'Semester data cleared.' });
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
