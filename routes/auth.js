const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');

const router = express.Router();

// Generate JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await OTP.deleteMany({ email });
        await OTP.create({ email, otp });

        if (process.env.BREVO_API_KEY) {
            const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                },
                body: JSON.stringify({
                    sender: { name: "StudyTrack Support", email: "siddharthdeveloper2006@gmail.com" },
                    to: [{ email }],
                    subject: "Your StudyTrack Verification Code",
                    htmlContent: `
                        <h2>StudyTrack Registration</h2>
                        <p>Your verification code is: <strong>${otp}</strong></p>
                        <p>This code is valid for 5 minutes.</p>
                    `
                })
            });
            const data = await brevoResponse.json();
            if (!brevoResponse.ok) {
                console.error("Brevo API error in send-otp:", data);
                throw new Error(data.message || "Failed to send OTP email via Brevo.");
            }
        } else {
            console.warn("BREVO_API_KEY missing, generated OTP:", otp);
        }

        res.json({ message: 'OTP sent to email.' });
    } catch (err) {
        console.error('SEND OTP ERROR:', err.message);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

        const validOtp = await OTP.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP.' });

        res.json({ message: 'OTP verified successfully.' });
    } catch (err) {
        console.error('VERIFY OTP ERROR:', err.message);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        if (!name || !email || !password || !otp) {
            return res.status(400).json({ message: 'All fields and OTP are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const validOtp = await OTP.findOne({ email, otp });
        if (!validOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const user = new User({ name, email, password });
        await user.save();
        
        await OTP.deleteMany({ email });

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
            if (!process.env.BREVO_API_KEY) {
                console.warn("BREVO_API_KEY missing in .env. Reset link generated but not sent via email.");
                return res.json({
                    message: "Email configuration is missing on the server. Please check environment variables.",
                    resetLink: resetUrl // Expose it here so it doesn't just hang in production without env vars
                });
            }

            // Brevo (Sendinblue) API Call - Sends to the actual user via HTTPS (Bypasses Render SMTP block)
            const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                },
                body: JSON.stringify({
                    sender: {
                        name: "StudyTrack Support",
                        email: "siddharthdeveloper2006@gmail.com" // Your verified sender email
                    },
                    to: [
                        { email: user.email } // The student who requested the reset
                    ],
                    subject: "Password Reset Request - StudyTrack",
                    htmlContent: `
                        <h2>Password Reset Request</h2>
                        <p>You requested a password reset for your StudyTrack account.</p>
                        <p>Please click the link below to set a new password. This link is valid for 1 hour.</p>
                        <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:white;text-decoration:none;border-radius:5px;margin-top:10px;">Reset Password</a>
                        <p style="margin-top:20px;font-size:12px;color:#666;">If you didn't request this, please ignore this email.</p>
                    `
                })
            });

            const brevoData = await brevoResponse.json();

            if (!brevoResponse.ok) {
                throw new Error(brevoData.message || "Brevo API failed to send the email.");
            }

            res.json({
                message: 'Password reset link sent securely to your email address.'
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

// @POST /api/auth/add-xp
router.post('/add-xp', require('../middleware/auth'), async (req, res) => {
    try {
        const { xpToAdd } = req.body;
        if (!xpToAdd || typeof xpToAdd !== 'number') {
            return res.status(400).json({ message: 'Valid xpToAdd is required.' });
        }

        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.xp = (user.xp || 0) + xpToAdd;

        // Level up logic (rough curve: each level takes 100 * level XP)
        const xpThreshold = user.level * 100;
        let leveledUp = false;
        if (user.xp >= xpThreshold) {
            user.level += 1;
            user.xp = user.xp - xpThreshold;
            leveledUp = true;
        }

        await user.save();

        res.json({ xp: user.xp, level: user.level, leveledUp });
    } catch (err) {
        console.error('ADD XP ERROR:', err.message);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;
