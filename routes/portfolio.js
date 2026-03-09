const express = require('express');
const { Project, Skill } = require('../models/Portfolio');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Projects
router.get('/projects', async (req, res) => {
    try { res.json(await Project.find({ user: req.userId }).sort({ createdAt: -1 })); }
    catch { res.status(500).json({ message: 'Server error.' }); }
});
router.post('/projects', async (req, res) => {
    try {
        const p = new Project({ ...req.body, user: req.userId });
        await p.save();
        res.status(201).json(p);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put('/projects/:id', async (req, res) => {
    try {
        const p = await Project.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { returnDocument: 'after' });
        res.json(p);
    } catch { res.status(500).json({ message: 'Server error.' }); }
});
router.delete('/projects/:id', async (req, res) => {
    try {
        await Project.findOneAndDelete({ _id: req.params.id, user: req.userId });
        res.json({ message: 'Deleted.' });
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

// Skills
router.get('/skills', async (req, res) => {
    try { res.json(await Skill.find({ user: req.userId }).sort({ category: 1 })); }
    catch { res.status(500).json({ message: 'Server error.' }); }
});
router.post('/skills', async (req, res) => {
    try {
        const s = new Skill({ ...req.body, user: req.userId });
        await s.save();
        res.status(201).json(s);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/skills/:id', async (req, res) => {
    try {
        await Skill.findOneAndDelete({ _id: req.params.id, user: req.userId });
        res.json({ message: 'Deleted.' });
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
