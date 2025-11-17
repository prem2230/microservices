import User from "../models/user.model.js";

export const handleRestaurantCreated = async (message) => {
    try{
        const { restaurantId, ownerId, name, isActive } = JSON.parse(message.value);

        await User.findByIdAndUpdate(ownerId, {
            $push: {
                restaurants: {
                    restaurantId,
                    name,
                    isActive
                }
            }
        });
        console.log(`Added restaurant ${restaurantId} to owner ${ownerId}`);
    }catch (error){
        console.error("Error handling restaurant created:", error);
    }
}

export const handleRestaurantUpdated = async (message) => {
    try{
        const { restaurantId,ownerId, name, isActive } = JSON.parse(message.value);

        await User.updateOne({
            _id: ownerId,
            'restaurants.restaurantId': restaurantId
        }, {
            $set: {
                'restaurants.$.name': name,
                'restaurants.$.isActive': isActive
            }
        })
        console.log(`Updated restaurant ${restaurantId} in user records.`);
    }catch (error){
        console.error("Error handling restaurant updated:", error);
    }
}

export const handleRestaurantDeleted = async (message) => {
    try{
        const { restaurantId, ownerId } = JSON.parse(message.value);

        await User.findByIdAndUpdate(ownerId, {
            $pull: {
                restaurants: {
                    restaurantId
                }
            }
        });

        console.log(`Removed restaurant ${restaurantId} from owner ${ownerId}`);
    }catch (error){ 
        console.error("Error handling restaurant deleted:", error);
    }
}