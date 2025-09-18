
import axios from 'axios';
const RESTAURANT_SERVICE_URL = 'http://localhost:3002';

export const validateRestaurant = async (id, token) => {
    try {
        const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/v1/restaurant/get-restaurant/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
       
        return response.data.success;

    } catch (error) {
        console.error('Error validating restaurant:', error);
        return false;
    }
}