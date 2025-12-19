import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

export default {
  apps: [{
    name: 'beeline-phone-bridge',
    script: 'phone-bridge-server.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      ...process.env  // Spread all environment variables
    },
    error_file: path.join(__dirname, 'logs', 'pm2-error.log'),
    out_file: path.join(__dirname, 'logs', 'pm2-out.log'),
    log_file: path.join(__dirname, 'logs', 'pm2-combined.log'),
    time: true
  }, {
    name: 'ip-monitor',
    script: 'ip-monitor.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '100M',
    env: {
      NODE_ENV: 'production',
      ...process.env  // Spread all environment variables
    },
    error_file: path.join(__dirname, 'logs', 'ip-monitor-error.log'),
    out_file: path.join(__dirname, 'logs', 'ip-monitor-out.log'),
    log_file: path.join(__dirname, 'logs', 'ip-monitor-combined.log'),
    time: true
  }]
};
