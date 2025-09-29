import express from 'express';
import { getOrdersByUser, getOrderById, placeOrder, updateOrderItems, updateOrderStatus, getOrdersByRestaurant, cancelOrder } from '../controllers/order.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import customerMiddleware from '../middlewares/customer.middleware.js';
import ownerMiddleware from '../middlewares/owner.middleware.js';

const router = express.Router();

router.post('/place-order', authMiddleware, customerMiddleware, placeOrder);
router.get('/get-all-ordersByUser', authMiddleware, customerMiddleware, getOrdersByUser);
router.get('/get-order/:orderId', authMiddleware, customerMiddleware, getOrderById);
router.put('/update-order/:orderId', authMiddleware, customerMiddleware,updateOrderItems );
router.put('/cancel-order/:orderId', authMiddleware, customerMiddleware, cancelOrder);
// router.delete('/delete-order/:orderId', authMiddleware, customerMiddleware, deleteOrder);
router.put('/update-order-status/:orderId', authMiddleware, ownerMiddleware, updateOrderStatus);
router.get('/get-all-ordersByRestaurant/:restaurantId',authMiddleware, ownerMiddleware, getOrdersByRestaurant)

export default router;
