
import axios from 'axios';
const USER_SERVICE_URL = 'http://localhost:3001';

export const checkRestaurantOwner = async (id,token) => {
  try {
    const ownerId = id;

    const response = await axios.get(`${USER_SERVICE_URL}/api/v1/users/getUser/${ownerId}`,{
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user.role === 'restaurant_owner';

  } catch (error) {
    console.error('Error verifying restaurant owner:', error);  
    return false;
  }
};

export const ownerMiddleware = (req, res, next) => {
  if (req.userRole !== 'restaurant_owner') {
    return res.status(403).json({ success: false, message: 'Restaurant owner access required' });
  }
  next();
};