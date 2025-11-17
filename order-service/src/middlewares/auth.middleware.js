import jwt from 'jsonwebtoken';

export const validateJWT = (token) => {
  try{
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return { success: true, user: decoded };
  }catch(error){
    return { success:false, error: error.message}
  }
}

export const authMiddleware = async (req, res, next) =>{
     try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });  ;
    }

    const result = validateJWT(token);

    if(!result.success){
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    let user = {
      id: result.user.userId,
      role: result.user.role
    }

    if(result.user.role === 'restaurant_owner'){
      user = {
        ...user,
        restaurants: result.user.restaurants || []
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

