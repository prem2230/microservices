import express from "express";
import { deleteRestaurant, getAllRestaurants, getRestaurantById, registerRestaurant, updateRestaurant } from "../controllers/restaurant.controller.js";
import { adminMiddleware, authMiddleware, ownerMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/register', authMiddleware, adminMiddleware, registerRestaurant);
router.get('/get-restaurants',authMiddleware,getAllRestaurants);
router.get('/get-restaurant/:id',authMiddleware, getRestaurantById);
router.put('/update-restaurant/:id', authMiddleware, ownerMiddleware, updateRestaurant);
router.delete('/delete-restaurant/:id', authMiddleware, adminMiddleware, deleteRestaurant);

export default router;
