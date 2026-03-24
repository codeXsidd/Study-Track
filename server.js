const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dns = require('dns');
require('dotenv').config();

// Enable reliable DNS globally to fix connectivity issues with AI/DB APIs on certain networks
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://smartstudy-hub.vercel.app', 'https://studytrack-hub.vercel.app'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize()); // Globally blocks NoSQL Injection by sanitizing req.body, req.query, and req.params
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/timetable-config', require('./routes/timetableConfig'));
app.use('/api/semesters', require('./routes/semesters'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/codeinsight', require('./routes/codeinsight'));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Disable buffering to fail fast if DB is down, instead of hanging forever
mongoose.set('bufferCommands', false);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout early rather than hanging
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
