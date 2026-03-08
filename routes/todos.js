const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.userId }).sort({ completed: 1, createdAt: -1 });
        res.json(todos);
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/', async (req, res) => {
    try {
        const payload = { ...req.body, user: req.userId };
        if (payload.dayPlan) payload.dayPlanDate = new Date();
        const todo = new Todo(payload);
        await todo.save();
        res.status(201).json(todo);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const update = { ...req.body };
        if (update.completed) update.completedAt = new Date();
        else if (update.completed === false) update.completedAt = null;
        if (update.dayPlan === true) update.dayPlanDate = new Date();
        else if (update.dayPlan === false) update.dayPlanDate = null;
        const todo = await Todo.findOneAndUpdate({ _id: req.params.id, user: req.userId }, update, { new: true });
        res.json(todo);
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await Todo.findOneAndDelete({ _id: req.params.id, user: req.userId });
        res.json({ message: 'Deleted.' });
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
