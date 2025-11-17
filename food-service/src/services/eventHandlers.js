import FoodItem from "../models/fooditem.model.js";

export const handleRestaurantDeleted = async (message) => {
    try{
        const { restaurantId } = JSON.parse(message.value);

        await FoodItem.updateMany(
            { restaurant: restaurantId },
            { isAvailable: false }
        );

        console.log(`Disabled food items for deleted restaurant: ${restaurantId}.`)
    }catch (error){
        console.error("Error handling restaurant deleted:", error);
    }
}