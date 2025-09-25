export const serviceAuthMiddleware = (req, res, next) => {
    const serviceToken = req.header('X-Service-Token');
    const serviceName = req.header('X-Service-Name');

    if(serviceToken === process.env.SECRET_KEY && serviceName === 'order-service'){
        req.isServiceCall = true
        return next();
    }
    next();
}