import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/database.js';
import restaurantRoutes from './src/routes/restaurant.routes.js';
import { closeKafka, initKafka } from './src/services/kafkaService.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT ;

app.use(cors());
app.use(express.json());

connectDB();

await initKafka();

app.use('/api/v1/restaurant', restaurantRoutes);
app.get('/api/v1/restaurant/health', (req,res) =>{
    res.json({
        service: 'Restaurant Service',
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

process.on('SIGTERM', async () => {
    await closeKafka();
    process.exit(0);
})

app.listen(PORT, () => {
    console.log(`Restaurant service is running on port ${PORT}`);
});