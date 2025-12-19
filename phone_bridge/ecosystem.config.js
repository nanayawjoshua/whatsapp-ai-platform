const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
const envConfig = dotenv.config({ path: path.join(__dirname, '.env') }).parsed || {};

module.exports = {
  apps: [{
    name: 'beeline-phone-bridge',
    script: 'phone-bridge-server.js',
    cwd: __dirname,  // Use current directory instead of hardcoded path
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      ...envConfig  // Spread all environment variables from .env
    },
    error_file: path.join(__dirname, 'logs', 'pm2-error.log'),
    out_file: path.join(__dirname, 'logs', 'pm2-out.log'),
    log_file: path.join(__dirname, 'logs', 'pm2-combined.log'),
    time: true
  }, {
    name: 'ip-monitor',
    script: 'ip-monitor.js',
    cwd: __dirname,  // Use current directory instead of hardcoded path
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '100M',
    env: {
      NODE_ENV: 'production',
      ...envConfig  // Spread all environment variables from .env
    },
    error_file: path.join(__dirname, 'logs', 'ip-monitor-error.log'),
    out_file: path.join(__dirname, 'logs', 'ip-monitor-out.log'),
    log_file: path.join(__dirname, 'logs', 'ip-monitor-combined.log'),
    time: true
  }]
};