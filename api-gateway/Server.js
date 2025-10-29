import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
// import cors from 'cors';
import axios from 'axios';

const app = express();

app.use('/api/v1/users', createProxyMiddleware({ target: 'http://user-service:3001', changeOrigin: true }));
app.use('/api/v1/restaurants', createProxyMiddleware({ target: 'http://restaurant-service:3002', changeOrigin: true }));
app.use('/api/v1/orders', createProxyMiddleware({ target: 'http://order-service:3003', changeOrigin: true }));
app.use('/api/v1/fooditem', createProxyMiddleware({ target: 'http://food-service:3004', changeOrigin: true }));

app.get('/health', async(req, res) => {
    const services = [
        { name: 'User service', url: 'http://user-service:3001' },
        { name: 'Restaurant service', url: 'http://restaurant-service:3002' },
        { name: 'Order service', url: 'http://order-service:3003' },
        { name: 'Food service', url: 'http://food-service:3004' }
    ]

    const healthChecks = await Promise.allSettled(
        services.map(async (service) => {
            try{
                const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
                return { name: service.name, status: 'UP', data: response.data };
            }catch(error){
                return { name: service.name, status: 'DOWN', error: error.message };
            }
        })
    );
    
    res.json({
        gateway: 'API Gateway',
        status: 'UP',
        timestamp: new Date().toISOString(),
        services: healthChecks.map((res) => res.value)
    })
})

app.listen(3000, () => {
    console.log('API Gateway is running on port 3000');
});