FROM node:18-alpine
WORKDIR /app

# Copy API Gateway
COPY api-gateway/package*.json ./
RUN npm install
COPY api-gateway/ ./

# Use Railway-specific server file
COPY api-gateway/Server.railway.js ./Server.js

# Expose port
EXPOSE 3000

CMD ["node", "Server.js"]