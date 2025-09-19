import express from "express";
import { addFoodItem, deleteFoodItem, getAllFoodItems, getFoodItemById, getFoodItemsByRestaurant, updateFoodItem } from "../controllers/fooditem.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import ownerMiddleware from "../middlewares/owner.middleware.js";

const router = express.Router();

router.post('/add-foodItem/:id', authMiddleware,ownerMiddleware, addFoodItem);
router.get('/get-all-foodItems', authMiddleware, getAllFoodItems);
router.get('/get-foodItem/:id', authMiddleware, getFoodItemById);
router.put('/update-foodItem/:id', authMiddleware, ownerMiddleware, updateFoodItem);
router.delete('/delete-foodItem/:id', authMiddleware, ownerMiddleware, deleteFoodItem);
router.get('/get-foodItems-by-restaurant/:restaurantId', authMiddleware, getFoodItemsByRestaurant);

export default router;
