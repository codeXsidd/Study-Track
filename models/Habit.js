const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Habit name is required'],
        trim: true
    },
    goal: {
        type: String,
        trim: true
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly'],
        default: 'daily'
    },
    completedDates: [{
        type: Date
    }],
    streak: {
        type: Number,
        default: 0
    },
    bestStreak: {
        type: Number,
        default: 0
    },
    totalCompleted: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);
