
const ownerMiddleware = (req, res, next) => {
    if(req.user.role !== 'restaurant_owner'){
        return res.status(403).json({
            success:false,
            message: 'Access denied. Restaurant owner privileges required'
        });
    }
    next();
}

export default ownerMiddleware;