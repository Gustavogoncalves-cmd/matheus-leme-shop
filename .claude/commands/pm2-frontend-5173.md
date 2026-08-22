description: Start frontend service (Vite on port 5173) and view logs

# Start frontend and view logs

```bash
cd /home/iamgustavo/obsidian-second-brain/projects/matheus-leme-shop && npx pm2 start ecosystem.config.cjs --only matheus-frontend-5173 && npx pm2 logs matheus-frontend-5173
```
