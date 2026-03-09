const express = require('express');
const TimetableConfig = require('../models/TimetableConfig');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const DEFAULT_PERIODS = Array.from({ length: 8 }, (_, i) => {
    const times = ['8:00-8:50', '8:55-9:45', '9:50-10:40', '10:45-11:35', '12:10-1:00', '1:05-1:55', '2:00-2:50', '2:55-3:45'];
    const [start, end] = times[i].split('-');
    return { number: i + 1, label: `P${i + 1}`, startTime: start, endTime: end };
});

router.get('/', async (req, res) => {
    try {
        let config = await TimetableConfig.findOne({ user: req.userId });
        if (!config) config = { totalPeriods: 8, periods: DEFAULT_PERIODS };
        res.json(config);
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/', async (req, res) => {
    try {
        const { totalPeriods, periods } = req.body;
        const config = await TimetableConfig.findOneAndUpdate(
            { user: req.userId },
            { totalPeriods, periods },
            { returnDocument: 'after', upsert: true }
        );
        res.json(config);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
