import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
// import cors from 'cors';

const app = express();

app.use('/api/v1/users', createProxyMiddleware({ target: 'http://user-service:3001', changeOrigin: true }));
app.use('/api/v1/restaurants', createProxyMiddleware({ target: 'http://restaurant-service:3002', changeOrigin: true }));
app.use('/api/v1/orders', createProxyMiddleware({ target: 'http://order-service:3003', changeOrigin: true }));
app.use('/api/v1/fooditem', createProxyMiddleware({ target: 'http://food-service:3004', changeOrigin: true }));

app.listen(3000, () => {
    console.log('API Gateway is running on port 3000');
});