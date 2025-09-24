import jwt from 'jsonwebtoken';

export const validateJWT = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return { success: true, user: decoded }

  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const result = validateJWT(token);

    if(!result.success){
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = {
      id: result.user.userId,
      role: result.user.role
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
}