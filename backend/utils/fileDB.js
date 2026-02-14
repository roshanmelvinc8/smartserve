const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'data.json');

class FileDatabase {
  constructor() {
    this.data = {
      users: [],
      tokens: []
    };
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(content);
      } else {
        this.data = { users: [], tokens: [] };
        this.saveToFile();
      }
    } catch (err) {
      console.log('Creating new database file');
      this.data = { users: [], tokens: [] };
      this.saveToFile();
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database:', err.message);
    }
  }

  // Users collection methods
  insertUser(user) {
    const id = crypto.randomBytes(12).toString('hex');
    user._id = id;
    this.data.users.push(user);
    this.saveToFile();
    return { insertedId: id };
  }

  findUser(query) {
    return this.data.users.find(u => {
      for (const [k, v] of Object.entries(query)) {
        if (u[k] !== v) return false;
      }
      return true;
    });
  }

  // Tokens collection methods
  insertToken(token) {
    const id = crypto.randomBytes(12).toString('hex');
    token._id = id;
    this.data.tokens.push(token);
    this.saveToFile();
    return { insertedId: id };
  }

  findTokens(query = {}) {
    return this.data.tokens.filter(t => {
      for (const [k, v] of Object.entries(query)) {
        if (typeof v === 'object' && v !== null) {
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
    this.data.tokens = this.data.tokens.map(t => {
      let match = true;
      for (const [k, v] of Object.entries(query)) {
        if (t[k] !== v) match = false;
      }
      if (match) {
        found = true;
        const updated = { ...t, ...update.$set };
        return updated;
      }
      return t;
    });
    if (found) this.saveToFile();
    return { modifiedCount: found ? 1 : 0 };
  }

  updateManyTokens(query, update) {
    let count = 0;
    this.data.tokens = this.data.tokens.map(t => {
      let match = true;
      for (const [k, v] of Object.entries(query)) {
        if (Array.isArray(v) && v.includes(t[k])) {
          match = true;
        } else if (!Array.isArray(v) && t[k] !== v) {
          match = false;
        }
      }
      if (match) {
        count++;
        return { ...t, ...update.$set };
      }
      return t;
    });
    if (count > 0) this.saveToFile();
    return { modifiedCount: count };
  }

  deleteToken(query) {
    const before = this.data.tokens.length;
    this.data.tokens = this.data.tokens.filter(t => {
      for (const [k, v] of Object.entries(query)) {
        if (t[k] !== v) return true;
      }
      return false;
    });
    const after = this.data.tokens.length;
    if (before !== after) this.saveToFile();
    return { deletedCount: before - after };
  }

  getAllTokens() {
    return this.data.tokens;
  }

  getTokensByDate(date) {
    return this.data.tokens.filter(t => {
      const tokenDate = new Date(t.created_at).toISOString().split('T')[0];
      const queryDate = new Date(date).toISOString().split('T')[0];
      return tokenDate === queryDate;
    });
  }
}

module.exports = FileDatabase;
