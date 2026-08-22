# PM2 Start All Services

Start all services (backend + frontend) and open PM2 monitor.

```bash
cd /home/iamgustavo/obsidian-second-brain/projects/matheus-leme-shop && npx pm2 start ecosystem.config.cjs && npx pm2 monit
```

**Services:**
- Backend (Express) on http://localhost:3000
- Frontend (Vite) on http://localhost:5173
