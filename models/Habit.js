const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    goal: { type: String, default: '' },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    streak: { type: Number, default: 0 },
    completedDates: { type: [String], default: [] } // Array of "YYYY-MM-DD"
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);
