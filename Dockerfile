# Railway root Dockerfile — delegates to backend service.
# Railway requires a Dockerfile at the project root when the repo contains multiple services.
FROM node:20-alpine

WORKDIR /app

# Copy all backend source code first (package-lock.json is gitignored, so use npm install)
COPY backend/ .

# Copy shared data files (referenced by seeds via relative path ../../shared/)
COPY shared/ ../shared/

# Install production dependencies (npm ci requires a lockfile, which is gitignored)
RUN npm install --omit=dev && npm cache clean --force

# Expose API port
EXPOSE 3000

# Health check (PORT comes from Railway env, fallback 3000)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health', (r) => {if (r.statusCode !== 200) process.exit(1)}).on('error', () => process.exit(1))"

# Start the backend
CMD ["npm", "start"]