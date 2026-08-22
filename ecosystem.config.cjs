module.exports = {
  apps: [
    {
      name: 'matheus-backend-3000',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      watch: ['src'],
      ignore_watch: ['node_modules', 'dist'],
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
    {
      name: 'matheus-frontend-5173',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      watch: ['src', 'public'],
      ignore_watch: ['node_modules', 'dist', '.next'],
      env: {
        NODE_ENV: 'development',
        VITE_API_URL: 'http://localhost:3000/api',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/matheus-leme-shop.git',
      path: '/var/www/matheus-leme-shop',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
    },
  },
};
