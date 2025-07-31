import axios from 'axios';

const USER_SERVICE_URL = 'http://localhost:3001';

export const authMiddleware = async (req, res, next) =>{
     try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied' });
    }

    const response = await axios.get(`${USER_SERVICE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    req.user = response.data.user;
    req.userId = response.data.user.id;
    req.userRole = response.data.user.role;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

export const ownerMiddleware = (req, res, next) => {
  if (req.userRole !== 'restaurant_owner') {
    return res.status(403).json({ success: false, message: 'Restaurant owner access required' });
  }
  next();
};