const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET all notes
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ user: req.userId }).sort({ pinned: -1, createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST add note
router.post('/', async (req, res) => {
    try {
        const { content, color } = req.body;
        if (!content) return res.status(400).json({ message: 'Content is required.' });
        const note = new Note({ content, color: color || '#6366f1', user: req.userId });
        await note.save();
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT update note (edit or toggle pin)
router.put('/:id', async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { returnDocument: 'after' }
        );
        if (!note) return res.status(404).json({ message: 'Note not found.' });
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE note
router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!note) return res.status(404).json({ message: 'Note not found.' });
        res.json({ message: 'Note deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
