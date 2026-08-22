# PM2 Start Backend (3000)

Start backend service and open logs.

```bash
npx pm2 start ecosystem.config.cjs --only matheus-backend-3000 && npx pm2 logs matheus-backend-3000
```

**Service:** Express API on http://localhost:3000
