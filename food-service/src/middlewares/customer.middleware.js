export const customerMiddleware = (req, res, next) => {
    if(req.user.role !== 'customer'){
        return res.status(403).json({ success: false, message: 'Customer access required' });
    }
    next();
}