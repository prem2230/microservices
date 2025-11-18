FROM node:18-alpine
WORKDIR /app

# Copy API Gateway
COPY api-gateway/package*.json ./
RUN npm install
COPY api-gateway/ ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]