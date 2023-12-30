import log4js from 'log4js';
import { app } from 'electron';
import path from 'path';

const logsDir = app.getPath('logs');
const logFileName = path.join(logsDir, 'combined.log');

log4js.configure({
  appenders: {
    file: {
      type: 'dateFile',
      filename: logFileName,
      pattern: '.yyyy-MM-dd',
      compress: true,
      maxLogSize: 10485760, // 10 MB
      backups: 3 // keep last 3 backup files
    },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['file', 'console'], level: 'debug' }
  }
});

export default log4js.getLogger();