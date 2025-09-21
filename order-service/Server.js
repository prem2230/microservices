import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/database.js';
import orderRoutes from './src/routes/order.route.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT ;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/v1/order', orderRoutes);
app.get('/api/v1/order/health', (req,res) =>{
    res.json({
        service: 'Order Service',
        status: 'OK',
        port: PORT,
        timestamp: new Date().toISOString()
    })
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success:false,
        message:'Something went wrong',
    });
});

app.use((req, res) =>{
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});


app.listen(PORT, () => {
    console.log(`Order service is running on port ${PORT}`);
});