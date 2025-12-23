import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

app.use('/api/v1/users', createProxyMiddleware({
    target: 'http://user-service:8080',
    changeOrigin: true,
    onError: (err, req, res) => {
        res.status(500).json({ error: 'User service is unavailable' });
    }
}));
app.use('/api/v1/restaurant', createProxyMiddleware({
    target: 'http://restaurant-service:8080',
    changeOrigin: true,
    onError: (err, req, res) => {
        res.status(500).json({ error: 'Restaurant service is unavailable' });
    }
}));

app.use('/api/v1/orders', createProxyMiddleware({
    target: 'http://order-service:8080',
    changeOrigin: true,
    onError: (err, req, res) => {
        res.status(500).json({ error: 'Order service is unavailable' });
    }
}));

app.use('/api/v1/fooditem', createProxyMiddleware({
    target: 'http://food-service:8080',
    changeOrigin: true,
    onError: (err, req, res) => {
        res.status(500).json({ error: 'Food service is unavailable' });
    }
}));

app.get('/health', async (req, res) => {
    const services = [
        { name: 'User service', url: 'http://user-service:8080/api/v1/users/health' },
        { name: 'Restaurant service', url: 'http://restaurant-service:8080/api/v1/restaurant/health' },
        { name: 'Order service', url: 'http://order-service:8080/api/v1/orders/health' },
        { name: 'Food service', url: 'http://food-service:8080/api/v1/fooditem/health' },
    ]

    const healthChecks = await Promise.allSettled(
        services.map(async (service) => {
            try {
                const response = await axios.get(`${service.url}`, { timeout: 25000 }); // for openshift timeout removed
                return { name: service.name, status: 'UP', data: response.data };
            } catch (error) {
                return { name: service.name, status: 'DOWN', error: error.message };
            }
        })
    );

    return res.json({
        gateway: 'API Gateway',
        status: 'UP',
        timestamp: new Date().toISOString(),
        services: healthChecks.map((res) => res.value)
    })
})

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
    console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});