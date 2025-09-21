
import axios from 'axios';
const FOOD_SERVICE_URL = "http://localhost:3003/api/v1/fooditem";

export const getFoodItem = async (foodItemId, token) => {
  try {
    const response = await axios.get(`${FOOD_SERVICE_URL}/get-foodItem/${foodItemId}`,{
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.foodItem;
  } catch (error) {
    console.error("Error fetching food item:", error);
    throw error;
  }
};