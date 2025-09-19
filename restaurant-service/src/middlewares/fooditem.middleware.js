
import  axios  from 'axios';
const FOOD_SERVICE_URL = 'http://localhost:3003/api/v1/fooditem';

export const getFoodItems = async (id,token) => {
    try {
        const response = await axios.get(`${FOOD_SERVICE_URL}/get-fooditems-by-restaurant/${id}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )
        if (!response.data.success) {
            return null
        }
        return response.data.foodItems;
    } catch (error) {
        console.error('Error fetching food items:', error);
        return null;
    }
};