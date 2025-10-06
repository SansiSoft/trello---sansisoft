// const fs = require('fs');
// const path = require('path');

// const logFilePath = path.join(__dirname, '../logs/app.log'); // cambia la ruta si quieres

// // helper para escribir en archivo
// function writeToFile(message) {
//   fs.appendFileSync(logFilePath, message + '\n', 'utf8');
// }

const logger = {
  format: (level, msg) => {
    const tag = `[${level}]`.padEnd(10);
    return `${tag} ${new Date().toISOString()} - ${msg}`;
  },

  info: (msg) => {
    const log = logger.format("INFO", msg);
    console.log(log);
    // writeToFile(log);
  },
  success: (msg) => {
    const log = logger.format("SUCCESS", msg);
    console.log(log);
    // writeToFile(log);
  },
  warn: (msg) => {
    const log = logger.format("WARN", msg);
    console.warn(log);
    // writeToFile(log);
  },
  error: (msg) => {
    const log = logger.format("ERROR", msg);
    console.error(log);
    // writeToFile(log);
  },
};

module.exports = { logger };

