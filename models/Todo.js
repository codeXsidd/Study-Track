const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    category: { type: String, enum: ['Study', 'Assignment', 'Personal', 'College', 'Project', 'Other'], default: 'Study' },
    dueDate: { type: Date, default: null },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    pinned: { type: Boolean, default: false },
    dayPlan: { type: Boolean, default: false },
    dayPlanDate: { type: Date, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);
