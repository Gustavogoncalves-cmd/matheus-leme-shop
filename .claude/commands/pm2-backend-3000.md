description: Start backend service (Express.js on port 3000) and view logs

# Start backend and view logs

```bash
cd /home/iamgustavo/obsidian-second-brain/projects/matheus-leme-shop && npx pm2 start ecosystem.config.cjs --only matheus-backend-3000 && npx pm2 logs matheus-backend-3000
```
