import express from "express";
import { addFoodItem, deleteFoodItem, getAllFoodItems, getFoodItemById, getFoodItemsByRestaurant, updateFoodItem, updateFoodItemQuantity } from "../controllers/fooditem.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ownerMiddleware } from "../middlewares/owner.middleware.js";
import { customerMiddleware } from "../middlewares/customer.middleware.js";
import { serviceAuthMiddleware } from "../middlewares/serviceAuth.middleware.js";

const router = express.Router();

const allowServiceOrUser = [serviceAuthMiddleware, authMiddleware]

router.post('/add-foodItem/:restaurantId', authMiddleware,ownerMiddleware, addFoodItem);
router.put('/update-foodItem/:id', authMiddleware, ownerMiddleware, updateFoodItem);
router.delete('/delete-foodItem/:id', authMiddleware, ownerMiddleware, deleteFoodItem);
router.put('/update-foodItem-quantity/:id', authMiddleware, ownerMiddleware, updateFoodItemQuantity);
router.get('/get-all-foodItems', authMiddleware,customerMiddleware, getAllFoodItems);
router.get('/get-foodItems-by-restaurant/:restaurantId', authMiddleware, getFoodItemsByRestaurant);
router.get('/get-fooditem/:id',allowServiceOrUser,getFoodItemById);

export default router;
