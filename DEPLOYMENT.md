# Food Delivery Microservices Deployment Guide

## Prerequisites

1. **Docker Hub Account**: Create account at [hub.docker.com](https://hub.docker.com)
2. **Docker Desktop**: Install and login to Docker Hub
3. **Git**: For version control

## Step-by-Step Deployment

### 1. Login to Docker Hub
```bash
docker login
```

### 2. Update Configuration
- Edit `build-and-push.bat` and replace `yourusername` with your Docker Hub username
- Edit `docker-compose.prod.yml` and replace `yourusername` with your Docker Hub username

### 3. Build and Push Images
```bash
# Run the build script
build-and-push.bat

# Or manually build each service:
docker build -t yourusername/food-delivery-user-service:latest ./user-service
docker push yourusername/food-delivery-user-service:latest
```

### 4. Deploy Locally (Testing)
```bash
# Using production compose file
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 5. Deploy to Production Server

#### Option A: Direct Docker Compose
1. Copy `docker-compose.prod.yml` to your server
2. Run: `docker-compose -f docker-compose.prod.yml up -d`

#### Option B: Kubernetes (Recommended for Production)
1. Use the Kubernetes manifests (create separately)
2. Deploy with `kubectl apply -f k8s/`

## Environment Variables

Create `.env` files for each service with:
```env
# Database connections
MONGODB_URI=mongodb://your-mongo-connection
POSTGRES_URI=postgresql://your-postgres-connection

# Kafka
KAFKA_BROKER=kafka-broker:9092

# JWT
JWT_SECRET=your-jwt-secret

# Service URLs (for inter-service communication)
USER_SERVICE_URL=http://user-service:3001
RESTAURANT_SERVICE_URL=http://restaurant-service:3002
ORDER_SERVICE_URL=http://order-service:3003
FOOD_SERVICE_URL=http://food-service:3004
```

## Service Endpoints

- **API Gateway**: http://localhost:3000
- **User Service**: http://localhost:3001
- **Restaurant Service**: http://localhost:3002
- **Order Service**: http://localhost:3003
- **Food Service**: http://localhost:3004
- **Kafka UI**: http://localhost:8080

## Monitoring & Logs

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f [service-name]

# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale user-service=3
```

## Troubleshooting

1. **Port Conflicts**: Change ports in docker-compose.prod.yml
2. **Memory Issues**: Add memory limits to services
3. **Network Issues**: Ensure all services are on same network
4. **Database Connections**: Verify connection strings in .env files

## Production Considerations

1. **Use External Databases**: Don't run databases in containers for production
2. **Load Balancer**: Use nginx or cloud load balancer
3. **SSL/TLS**: Configure HTTPS certificates
4. **Monitoring**: Add Prometheus, Grafana, or similar
5. **Backup Strategy**: Regular database backups
6. **CI/CD Pipeline**: Automate builds and deployments