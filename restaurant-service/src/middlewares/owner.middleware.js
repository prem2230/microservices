
export const ownerMiddleware = (req, res, next) => {
  if (req.user.role !== 'restaurant_owner') {
    return res.status(403).json({ success: false, message: 'Restaurant owner access required' });
  }
  next();
};