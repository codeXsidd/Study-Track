const express = require('express');
const JournalEntry = require('../models/JournalEntry');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
    try {
        const entries = await JournalEntry.find({ user: req.userId }).sort({ date: -1 });
        res.json(entries);
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/', async (req, res) => {
    try {
        const { date, subjects, hoursStudied, mood, notes, topics } = req.body;
        if (!date) return res.status(400).json({ message: 'Date required.' });
        const entry = await JournalEntry.findOneAndUpdate(
            { user: req.userId, date },
            { subjects: subjects || [], hoursStudied: hoursStudied || 0, mood: mood || '😐', notes: notes || '', topics: topics || '' },
            { returnDocument: 'after', upsert: true }
        );
        res.status(201).json(entry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.userId });
        res.json({ message: 'Deleted.' });
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
