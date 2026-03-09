const express = require('express');
const Timetable = require('../models/Timetable');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET all slots
router.get('/', async (req, res) => {
    try {
        const slots = await Timetable.find({ user: req.userId });
        res.json(slots);
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

// POST add slot
router.post('/', async (req, res) => {
    try {
        const { day, period, subject, teacher, room, color, startTime, endTime } = req.body;
        if (!day || !period || !subject) return res.status(400).json({ message: 'Day, period and subject required.' });

        // Upsert: if slot exists for this day/period, replace it
        const slot = await Timetable.findOneAndUpdate(
            { user: req.userId, day, period },
            { subject, teacher: teacher || '', room: room || '', color: color || '#6366f1', startTime: startTime || '', endTime: endTime || '' },
            { returnDocument: 'after', upsert: true }
        );
        res.status(201).json(slot);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE a slot
router.delete('/:id', async (req, res) => {
    try {
        await Timetable.findOneAndDelete({ _id: req.params.id, user: req.userId });
        res.json({ message: 'Slot deleted.' });
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
