const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// @route   GET /api/habits
// @desc    Get all habits for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { name, goal, frequency } = req.body;

        if (!name) {
            return res.status(400).json({ msg: 'Name is required' });
        }

        const newHabit = new Habit({
            user: req.userId,
            name,
            goal,
            frequency: frequency || 'daily'
        });

        const habit = await newHabit.save();
        res.json(habit);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/habits/:id
// @desc    Update a habit
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, goal, frequency } = req.body;

        // Build habit object
        const habitFields = {};
        if (name !== undefined) habitFields.name = name;
        if (goal !== undefined) habitFields.goal = goal;
        if (frequency !== undefined) habitFields.frequency = frequency;

        let habit = await Habit.findById(req.params.id);

        if (!habit) return res.status(404).json({ msg: 'Habit not found' });

        // Make sure user owns habit
        if (habit.user.toString() !== req.userId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        habit = await Habit.findByIdAndUpdate(
            req.params.id,
            { $set: habitFields },
            { returnDocument: 'after' }
        );

        res.json(habit);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Habit not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/habits/:id
// @desc    Delete a habit
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ msg: 'Habit not found' });
        }

        // Make sure user owns habit
        if (habit.user.toString() !== req.userId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await habit.deleteOne();

        res.json({ msg: 'Habit removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Habit not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/habits/:id/toggle
// @desc    Toggle completion status for today
// @access  Private
router.post('/:id/toggle', auth, async (req, res) => {
    try {
        const { date } = req.body; // ISO string date expected
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0); // Normalize to midnight

        let habit = await Habit.findById(req.params.id);

        if (!habit) return res.status(404).json({ msg: 'Habit not found' });

        if (habit.user.toString() !== req.userId) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Check if date is already in completedDates
        const existingDateIndex = habit.completedDates.findIndex(d => {
            const d1 = new Date(d);
            d1.setHours(0, 0, 0, 0);
            return d1.getTime() === targetDate.getTime();
        });

        if (existingDateIndex !== -1) {
            // Already completed today -> unmark
            habit.completedDates.splice(existingDateIndex, 1);
            habit.totalCompleted = Math.max(0, habit.totalCompleted - 1);
        } else {
            // Not completed today -> mark
            habit.completedDates.push(targetDate);
            habit.totalCompleted += 1;
        }

        // Calculate Streak
        // Naive streak calculation: Sort dates descending, check continuity
        if (habit.completedDates.length === 0) {
            habit.streak = 0;
        } else {
            // Sort dates descending
            const sortedDates = [...habit.completedDates].sort((a, b) => b - a);
            let currentStreak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let expectedDate = null;

            // Check if played today or yesterday, else streak is broken
            const mostRecentDate = new Date(sortedDates[0]);
            mostRecentDate.setHours(0, 0, 0, 0);

            if (mostRecentDate.getTime() === today.getTime()) {
                expectedDate = today;
            } else if (mostRecentDate.getTime() === yesterday.getTime()) {
                expectedDate = yesterday;
            }

            if (expectedDate !== null) {
                for (let i = 0; i < sortedDates.length; i++) {
                    const d = new Date(sortedDates[i]);
                    d.setHours(0, 0, 0, 0);

                    if (d.getTime() === expectedDate.getTime()) {
                        currentStreak++;
                        expectedDate.setDate(expectedDate.getDate() - 1); // Expect previous day for next iteration
                    } else {
                        break; // Streak broken
                    }
                }
            }

            habit.streak = currentStreak;
            if (habit.streak > habit.bestStreak) {
                habit.bestStreak = habit.streak;
            }
        }

        await habit.save();
        res.json(habit);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
