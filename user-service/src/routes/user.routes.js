import express from "express";
import {registerUser,loginUser, getProfile, getUserById} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const router = express.Router();   

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/profile',authMiddleware,getProfile);
router.get('/getUser/:id',authMiddleware,getUserById);

export default router;  