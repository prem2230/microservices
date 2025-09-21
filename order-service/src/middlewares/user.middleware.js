
import axios from 'axios';
const USER_SERVICE_URL = "http://localhost:3001/api/v1/users";

export const getUserById = async (id, token) => {
    try{
        const response = await axios.get(`${USER_SERVICE_URL}/getUser/${id}`,{
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.user;
    }catch(error){
        console.log(error);
        throw error;
    }
}