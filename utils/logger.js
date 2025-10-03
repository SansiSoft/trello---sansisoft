const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs/app.log');
function writeToFile(message) {
  fs.appendFileSync(logFilePath, message + '\n', 'utf8');
}

const logger = {
  info: (msg) => {
    const log = `[INFO] ${new Date().toISOString()} - ${msg}`;
    console.log(log);
    writeToFile(log);
  },
  success: (msg) => {
    const log = `[SUCCESS] ${new Date().toISOString()} - ${msg}`;
    console.log(log);
    writeToFile(log);
  },
  warn: (msg) => {
    const log = `[WARN] ${new Date().toISOString()} - ${msg}`;
    console.warn(log);
    writeToFile(log);
  },
  error: (msg) => {
    const log = `[ERROR] ${new Date().toISOString()} - ${msg}`;
    console.error(log);
    writeToFile(log);
  },
};

module.exports = { logger };
