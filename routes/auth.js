const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

// Generate JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('REGISTER ERROR:', err.message);
        res.status(500).json({ message: err.message || 'Server error.', error: err.message });
    }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err.message);
        res.status(500).json({ message: err.message || 'Server error.', error: err.message });
    }
});

// @GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (err) {
        console.error('ME ERROR:', err.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

// @POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal whether email exists — always return success
            return res.json({ message: 'If that email is registered, a reset link has been generated.' });
        }

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token with 1 hour expiry
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // In production: send email. For now, return the reset link directly.
        const resetUrl = `https://studytrack-hub.vercel.app/reset-password/${resetToken}`;

        try {
            if (!process.env.WEB3FORMS_ACCESS_KEY) {
                console.warn("WEB3FORMS_ACCESS_KEY missing in .env. Reset link generated but not sent via email.");
                return res.json({
                    message: "Email configuration is missing on the server. Please check environment variables.",
                    resetLink: resetUrl // Expose it here so it doesn't just hang in production without env vars
                });
            }

            // Web3Forms API Call
            const web3FormsResponse = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    access_key: process.env.WEB3FORMS_ACCESS_KEY,
                    subject: `StudyTrack Password Reset for ${user.email}`,
                    from_name: "StudyTrack System",
                    email: user.email, // This sets the reply-to to the user's email
                    message: `A password reset was requested for: ${user.email}. \n\nPlease use the following secure link to reset the password (valid for 1 hour): \n${resetUrl}`
                })
            });

            const web3Data = await web3FormsResponse.json();

            if (!web3Data.success) {
                throw new Error(web3Data.message || "Web3Forms API failed to send the email.");
            }

            res.json({
                message: 'Password reset link sent securely via Web3Forms.'
            });
        } catch (emailErr) {
            console.error('EMAIL SEND ERROR:', emailErr);

            // Revert changes if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiry = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({
                message: 'Error sending email. Please try again or check server configuration.',
                errorDetails: emailErr.message
            });
        }
    } catch (err) {
        console.error('FORGOT PASSWORD ERROR:', err.message);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        // Hash the incoming token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
        }

        // Update password and clear reset token
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpiry = null;
        await user.save();

        res.json({ message: 'Password reset successfully! You can now log in.' });
    } catch (err) {
        console.error('RESET PASSWORD ERROR:', err.message);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;
