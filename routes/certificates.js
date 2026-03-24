const express = require('express');
const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.use(auth);

// GET all certificates
router.get('/', async (req, res) => {
    try {
        const certs = await Certificate.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST upload certificate (PDF only, max 2MB)
router.post('/', (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Maximum size is 2MB.' });
            }
            return res.status(400).json({ message: err.message || 'Upload failed.' });
        }
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

        const { title } = req.body;
        if (!title) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Certificate title is required.' });
        }

        try {
            const cert = new Certificate({
                title,
                originalName: req.file.originalname,
                filename: req.file.filename,
                fileSize: req.file.size,
                user: req.userId
            });
            await cert.save();
            res.status(201).json(cert);
        } catch (dbErr) {
            fs.unlinkSync(req.file.path);
            res.status(500).json({ message: 'Server error.' });
        }
    });
});

// GET download a certificate
router.get('/:id/download', async (req, res) => {
    try {
        const cert = await Certificate.findOne({ _id: String(req.params.id), user: req.userId });
        if (!cert) return res.status(404).json({ message: 'Certificate not found.' });

        const safeFilename = path.basename(cert.filename || '');
        const filePath = path.join(__dirname, '..', 'uploads', safeFilename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on server.' });

        res.download(filePath, cert.originalName);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE a certificate
router.delete('/:id', async (req, res) => {
    try {
        const cert = await Certificate.findOneAndDelete({ _id: String(req.params.id), user: req.userId });
        if (!cert) return res.status(404).json({ message: 'Certificate not found.' });

        const safeFilename = path.basename(cert.filename || '');
        const filePath = path.join(__dirname, '..', 'uploads', safeFilename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        res.json({ message: 'Certificate deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
