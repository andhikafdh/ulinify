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
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  find(query) {
    const items = this.read();
    return items.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  insert(data) {
    const items = this.read();
    const newItem = {
      id: uuidv4(),
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

  aggregate(pipeline) {
    // Simple aggregation support
    let items = this.read();

    for (const stage of pipeline) {
      if (stage.$match) {
        items = items.filter(item => {
          return Object.keys(stage.$match).every(key => item[key] === stage.$match[key]);
        });
      }

      if (stage.$group) {
        const grouped = {};
        const groupKey = stage.$group._id;

        items.forEach(item => {
          const key = typeof groupKey === 'string' 
            ? item[groupKey.replace('$', '')] 
            : 'all';
          
          if (!grouped[key]) {
            grouped[key] = { _id: key };
            
            // Initialize accumulators
            Object.keys(stage.$group).forEach(field => {
              if (field !== '_id') {
                grouped[key][field] = 0;
              }
            });
          }

          // Apply accumulators
          Object.keys(stage.$group).forEach(field => {
            if (field !== '_id') {
              const accumulator = stage.$group[field];
              if (accumulator.$sum) {
                const value = typeof accumulator.$sum === 'number' 
                  ? accumulator.$sum 
                  : item[accumulator.$sum.replace('$', '')];
                grouped[key][field] += value || 0;
              }
            }
          });
        });

        items = Object.values(grouped);
      }
    }

    return items;
  }
}

// Collections
const submissionsDB = new Database('submissions');
const usersDB = new Database('users');
const auditLogDB = new Database('audit_log');

module.exports = {
  Database,
  submissionsDB,
  usersDB,
  auditLogDB
};
