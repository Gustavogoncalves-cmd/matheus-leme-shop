module.exports = {
  apps: [
    // Backend - Express.js
    {
      name: 'matheus-backend-3000',
      cwd: './backend',
      script: 'src/index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '500M'
    },
    // Frontend - Vite
    {
      name: 'matheus-frontend-5173',
      cwd: './frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: '--host 0.0.0.0 --port 5173',
      interpreter: 'node',
      env: {
        NODE_ENV: 'development'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      // No PM2 watch here: Vite's own HMR already reloads on source changes.
      // Running both made PM2 restart Vite, Vite rewrite its cache, PM2 see
      // that write and restart again - a loop that hit 1800+ restarts and
      // tore the app down mid-login, so the session never reached storage.
      watch: false,
      max_memory_restart: '300M'
    }
  ]
};
