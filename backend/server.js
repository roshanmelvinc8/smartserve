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

// ===== SIMULATED IN-MEMORY DATABASE =====
class MockDatabase {
  constructor() {
    this.users = [];
    this.tokens = [];
  }

  // Users collection methods
  insertUser(user) {
    const id = require('crypto').randomBytes(12).toString('hex');
    user._id = id;
    this.users.push(user);
    return { insertedId: id };
  }

  findUser(query) {
    return this.users.find(u => {
      for (const [k, v] of Object.entries(query)) {
        if (u[k] !== v) return false;
      }
      return true;
    });
  }

  // Tokens collection methods
  insertToken(token) {
    const id = require('crypto').randomBytes(12).toString('hex');
    token._id = id;
    this.tokens.push(token);
    return { insertedId: id };
  }

  findTokens(query = {}) {
    return this.tokens.filter(t => {
      for (const [k, v] of Object.entries(query)) {
        if (typeof v === 'object' && v !== null) {
          // Handle operators like { $gte: ... }
          if (v.$gte && !(t[k] >= v.$gte)) return false;
        } else if (t[k] !== v) return false;
      }
      return true;
    });
  }

  findToken(query) {
    return this.findTokens(query)[0];
  }

  updateToken(query, update) {
    let found = false;
    this.tokens = this.tokens.map(t => {
      let match = true;
      for (const [k, v] of Object.entries(query)) {
        if (t[k] !== v) match = false;
      }
      if (match) {
        found = true;
        return { ...t, ...update.$set };
      }
      return t;
    });
    return { modifiedCount: found ? 1 : 0 };
  }

  updateManyTokens(query, update) {
    let count = 0;
    this.tokens = this.tokens.map(t => {
      let match = true;
      for (const [k, v] of Object.entries(query)) {
        if (t[k] !== v) match = false;
      }
      if (match) {
        count++;
        return { ...t, ...update.$set };
      }
      return t;
    });
    return { modifiedCount: count };
  }

  countTokens(query = {}) {
    return this.findTokens(query).length;
  }
}

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from parent directory or public folder (HTML, CSS, JS)
const publicPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '..');
app.use(express.static(publicPath));

// Attach mock DB to app
app.db = new MockDatabase();

// ===== INITIALIZE TEST DATA =====
app.db.users.push({
  _id: '507f1f77bcf86cd799439011',
  name: 'Alice Admin',
  email: 'admin@college.edu',
  password: 'adminpass',
  role: 'admin'
});

app.db.users.push({
  _id: '507f1f77bcf86cd799439012',
  name: 'Bob Staff',
  email: 'staff@college.edu',
  password: 'staffpass',
  role: 'staff',
  service: 'Bonafide'
});

app.db.users.push({
  _id: '507f1f77bcf86cd799439013',
  name: 'Charlie Student',
  email: 'student@college.edu',
  password: 'studentpass',
  role: 'student'
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
  console.log('Using in-memory mock database (install MongoDB for persistence)');
});
