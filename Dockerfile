# Railway root Dockerfile — delegates to backend service.
# Railway requires a Dockerfile at the project root when the repo contains multiple services.
FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy backend source code
COPY backend/ .

# Copy shared data files (referenced by seeds via relative path)
COPY shared/ ../shared/

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) process.exit(1)}).on('error', () => process.exit(1))"

# Start the backend
CMD ["npm", "start"]