
## PM2 Services

**Quick Start:**
```bash
npx pm2 start ecosystem.config.cjs
npx pm2 monit              # View live monitor
npx pm2 logs               # View logs
npx pm2 status             # View status
npx pm2 restart all        # Restart services
npx pm2 stop all           # Stop services
```

**Services:**

| Port | Name | Type |
|------|------|------|
| 3000 | matheus-backend-3000 | Express.js |
| 5173 | matheus-frontend-5173 | Vite |

**Commands:**
- `npx pm2 start ecosystem.config.cjs` - Start all services (first time)
- `npx pm2 start all` - Start all services (after first time)
- `npx pm2 stop all` - Stop all services
- `npx pm2 restart all` - Restart all services
- `npx pm2 start matheus-backend-3000` - Start backend only
- `npx pm2 stop matheus-backend-3000` - Stop backend only
- `npx pm2 start matheus-frontend-5173` - Start frontend only
- `npx pm2 stop matheus-frontend-5173` - Stop frontend only
- `npx pm2 logs` - View all logs
- `npx pm2 logs matheus-backend-3000` - View backend logs
- `npx pm2 logs matheus-frontend-5173` - View frontend logs
- `npx pm2 monit` - Live monitor panel
- `npx pm2 status` - Show process status
- `npx pm2 resurrect` - Restore saved processes

**Slash Commands:**
- `/pm2-all` - Start all services + monit
- `/pm2-all-stop` - Stop all services
- `/pm2-restart-all` - Restart all services
- `/pm2-backend-3000` - Start backend + logs
- `/pm2-backend-stop` - Stop backend
- `/pm2-frontend-5173` - Start frontend + logs
- `/pm2-frontend-stop` - Stop frontend
- `/pm2-logs` - View all logs
- `/pm2-status` - Show process status

**Tips:**
- First time: Run `npx pm2 start ecosystem.config.cjs && npx pm2 save`
- After that: Just use `npx pm2 start all` or `npx pm2 resurrect`
- Watch mode enabled for both services (auto-restart on file changes)
- Logs stored in `{service}/logs/` directory
- Backend watches: `src/`
- Frontend watches: `src/`, `index.html`
