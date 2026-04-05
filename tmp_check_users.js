const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await User.countDocuments();
        console.log('User count:', count);
        const lastUser = await User.findOne().sort({ createdAt: -1 });
        if (lastUser) {
            console.log('Last user email:', lastUser.email);
            console.log('Last user created at:', lastUser.createdAt);
        } else {
            console.log('No users found.');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
