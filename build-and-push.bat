@echo off
echo Building and pushing microservices to Docker Hub...

REM Replace 'yourusername' with your actual Docker Hub username
set DOCKER_USERNAME=premkumar850

REM Build and tag images
echo Building user-service...
docker build -t %DOCKER_USERNAME%/food-delivery-user-service:latest ./user-service
docker build -t %DOCKER_USERNAME%/food-delivery-user-service:v1.0 ./user-service

echo Building restaurant-service...
docker build -t %DOCKER_USERNAME%/food-delivery-restaurant-service:latest ./restaurant-service
docker build -t %DOCKER_USERNAME%/food-delivery-restaurant-service:v1.0 ./restaurant-service

echo Building order-service...
docker build -t %DOCKER_USERNAME%/food-delivery-order-service:latest ./order-service
docker build -t %DOCKER_USERNAME%/food-delivery-order-service:v1.0 ./order-service

echo Building food-service...
docker build -t %DOCKER_USERNAME%/food-delivery-food-service:latest ./food-service
docker build -t %DOCKER_USERNAME%/food-delivery-food-service:v1.0 ./food-service

echo Building api-gateway...
docker build -t %DOCKER_USERNAME%/food-delivery-api-gateway:latest ./api-gateway
docker build -t %DOCKER_USERNAME%/food-delivery-api-gateway:v1.0 ./api-gateway

REM Push to Docker Hub
echo Pushing images to Docker Hub...
docker push %DOCKER_USERNAME%/food-delivery-user-service:latest
docker push %DOCKER_USERNAME%/food-delivery-user-service:v1.0

docker push %DOCKER_USERNAME%/food-delivery-restaurant-service:latest
docker push %DOCKER_USERNAME%/food-delivery-restaurant-service:v1.0

docker push %DOCKER_USERNAME%/food-delivery-order-service:latest
docker push %DOCKER_USERNAME%/food-delivery-order-service:v1.0

docker push %DOCKER_USERNAME%/food-delivery-food-service:latest
docker push %DOCKER_USERNAME%/food-delivery-food-service:v1.0

docker push %DOCKER_USERNAME%/food-delivery-api-gateway:latest
docker push %DOCKER_USERNAME%/food-delivery-api-gateway:v1.0

echo All images pushed successfully!
pause