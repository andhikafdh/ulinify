const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = process.env.DATABASE_DIR || './data';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Simple JSON file-based database
 */
class Database {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.ensureFile();
  }

  ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  findAll() {
    return this.read();
  }

  findById(id) {
    const items = this.read();
    return items.find(item => item.id === id);
  }

  findOne(query) {
    const items = this.read();
    return items.find(item => {
      return Object.keys(query).every(key => {
        if (typeof query[key] === 'object' && query[key].$regex) {
          return new RegExp(query[key].$regex, query[key].$options || '').test(item[key]);
        }
        return item[key] === query[key];
      });
    });
  }

  find(query = {}) {
    const items = this.read();
    if (Object.keys(query).length === 0) return items;
    
    return items.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  insert(data) {
    const items = this.read();
    const newItem = {
      id: data.id || uuidv4(), // Use provided ID if available
      created_at: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    this.write(items);
    return newItem;
  }

  update(id, data) {
    const items = this.read();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    this.write(items);
    return items[index];
  }

  delete(id) {
    const items = this.read();
    const filtered = items.filter(item => item.id !== id);
    this.write(filtered);
    return filtered.length < items.length;
  }

  deleteMany(query) {
    const items = this.read();
    const filtered = items.filter(item => {
      return !Object.keys(query).every(key => item[key] === query[key]);
    });
    this.write(filtered);
    return items.length - filtered.length;
  }
}

// Collections
const usersDB = new Database('users');
const challengesDB = new Database('challenges');
const userChallengesDB = new Database('user_challenges');
const userProgressDB = new Database('user_progress');

module.exports = {
  Database,
  usersDB,
  challengesDB,
  userChallengesDB,
  userProgressDB
};
