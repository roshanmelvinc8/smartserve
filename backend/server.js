const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');
const FileDatabase = require('./utils/fileDB');

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from parent directory or public folder (HTML, CSS, JS)
const publicPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '..');
app.use(express.static(publicPath));

// Attach file-based persistent database to app
app.db = new FileDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', tokens: app.db.data.tokens.length });
});

// Debug endpoint - check database contents
app.get('/debug/tokens', (req, res) => {
  res.json({ 
    token_count: app.db.data.tokens.length,
    tokens: app.db.data.tokens,
    db_file: require('path').join(__dirname, '..', 'data.json')
  });
});

// Root route - serve login page
app.get('/', (req, res) => {
  const loginPath = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, 'public', 'login.html')
    : path.join(__dirname, '..', 'login.html');
  res.sendFile(loginPath);
});

// Routes
app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/staff', staffRoutes);
app.use('/admin', adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`SmartServe backend running on http://${HOST}:${PORT}`);
  console.log('Using file-based persistent database (data.json)');
});
