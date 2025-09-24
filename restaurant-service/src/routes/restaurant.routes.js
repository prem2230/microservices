import express from "express";
import { deleteRestaurant, getAllRestaurants, getRestaurantById, getRestaurantByOwner, registerRestaurant, updateRestaurant } from "../controllers/restaurant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { ownerMiddleware } from "../middlewares/owner.middleware.js";
import { customerMiddleware } from "../middlewares/customer.middleware.js";

const router = express.Router();

router.post('/register', authMiddleware, ownerMiddleware, registerRestaurant);
router.put('/update-restaurant/:id', authMiddleware, ownerMiddleware, updateRestaurant);
router.delete('/delete-restaurant/:id', authMiddleware, ownerMiddleware, deleteRestaurant);
router.get('/get-restaurants',authMiddleware,customerMiddleware, getAllRestaurants);
router.get('/get-restaurant/:id',authMiddleware,customerMiddleware, getRestaurantById);
router.get('/get-restaurants-by-owner', authMiddleware, ownerMiddleware, getRestaurantByOwner)

export default router;
