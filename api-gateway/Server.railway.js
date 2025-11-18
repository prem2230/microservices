import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// Simple health check that doesn't depend on other services
app.get('/health', (req, res) => {
    res.json({
        gateway: 'API Gateway',
        status: 'UP',
        timestamp: new Date().toISOString(),
        message: 'Food Delivery API Gateway is running'
    });
});

// Basic API routes for demo
app.get('/', (req, res) => {
    res.json({
        message: 'Food Delivery API Gateway',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            users: '/api/v1/users',
            restaurants: '/api/v1/restaurant',
            orders: '/api/v1/orders',
            fooditems: '/api/v1/fooditem'
        }
    });
});

// Mock endpoints for demo
app.get('/api/v1/users', (req, res) => {
    res.json({ message: 'User service endpoint', status: 'Available' });
});

app.get('/api/v1/restaurant', (req, res) => {
    res.json({ message: 'Restaurant service endpoint', status: 'Available' });
});

app.get('/api/v1/orders', (req, res) => {
    res.json({ message: 'Order service endpoint', status: 'Available' });
});

app.get('/api/v1/fooditem', (req, res) => {
    res.json({ message: 'Food service endpoint', status: 'Available' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
    console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});