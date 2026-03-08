const express = require('express');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

// Helper function to get YYYY-MM-DD
const getDateStr = (d = new Date()) => {
    const p = new Date(d);
    p.setMinutes(p.getMinutes() - p.getTimezoneOffset());
    return p.toISOString().split('T')[0];
};

const updateStreak = (habit) => {
    if (habit.completedDates.length === 0) {
        habit.streak = 0;
        return habit;
    }
    const sorted = [...habit.completedDates].sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let d = new Date();
    // Check if today is completed, if not check yesterday
    if (sorted[0] === getDateStr(d)) {
        streak++;
        d.setDate(d.getDate() - 1);
    } else if (sorted[0] !== getDateStr(new Date(new Date().setDate(new Date().getDate() - 1)))) {
        // Did not complete today or yesterday -> streak broken
        habit.streak = 0;
        return habit;
    }

    let curStr = getDateStr(d);
    for (const date of sorted) {
        if (sorted[0] === getDateStr(new Date()) && streak === 1 && date === sorted[0]) continue; // already counted today

        if (date === curStr) {
            streak++;
            d.setDate(d.getDate() - 1);
            curStr = getDateStr(d);
        } else if (date < curStr) {
            break;
        }
    }
    habit.streak = streak;
    return habit;
};

router.get('/', async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.userId }).sort({ createdAt: -1 });

        // Update streaks automatically on fetch in case they missed days
        const updatedHabits = await Promise.all(habits.map(async h => {
            const beforeStreak = h.streak;
            updateStreak(h);
            if (beforeStreak !== h.streak) {
                await h.save();
            }
            return h;
        }));

        res.json(updatedHabits);
    } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', async (req, res) => {
    try {
        const habit = new Habit({ ...req.body, user: req.userId });
        await habit.save();
        res.status(201).json(habit);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const habit = await Habit.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
        res.json(habit);
    } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
        res.json({ message: 'Deleted' });
    } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/:id/toggle', async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) return res.status(400).json({ message: 'Date required' });

        const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
        if (!habit) return res.status(404).json({ message: 'Not found' });

        const idx = habit.completedDates.indexOf(date);
        if (idx > -1) {
            habit.completedDates.splice(idx, 1);
        } else {
            habit.completedDates.push(date);
        }

        updateStreak(habit);
        await habit.save();
        res.json(habit);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
