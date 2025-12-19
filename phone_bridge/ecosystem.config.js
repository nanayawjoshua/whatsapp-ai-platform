module.exports = {
  apps: [{
    name: 'beeline-phone-bridge',
    script: 'phone-bridge-server.js',
    cwd: '/data/data/com.termux/files/home/beeline/phone_bridge',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/data/data/com.termux/files/home/beeline/phone_bridge/logs/pm2-error.log',
    out_file: '/data/data/com.termux/files/home/beeline/phone_bridge/logs/pm2-out.log',
    log_file: '/data/data/com.termux/files/home/beeline/phone_bridge/logs/pm2-combined.log',
    time: true
  }, {
    name: 'ip-monitor',
    script: 'ip-monitor.js',
    cwd: '/data/data/com.termux/files/home/beeline/phone_bridge',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '100M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/data/data/com.termux/files/home/beeline/phone_bridge/logs/ip-monitor-error.log',
    out_file: '/data/data/com.termux/files/home/beeline/phone_bridge/logs/ip-monitor-out.log',
    log_file: '/data/data/com.termux/files/home/beeline/phone_bridge/logs/ip-monitor-combined.log',
    time: true
  }]
};