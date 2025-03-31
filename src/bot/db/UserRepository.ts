import { User } from "../../entity/User";
import { Result } from "../utils/Result";
import { UserDTO } from "../dtos/UserDTO";

export default class UserRepository {
    
    static async saveUser(userDTO: UserDTO) {
        try {
            const user = new User();
            user.userId = userDTO.userId.toString();
            await user.save();

            return Result.success();
        }
        catch(e) {
            console.log(`User with id: ${userDTO.userId} already exists (expected in normal operation)`);
            return Result.failure(new Error("User already exists"));
        }
    }

    static async deleteUser(userDTO: UserDTO) {
        try {
            await User.delete({ userId: userDTO.userId.toString() });
            return Result.success();
        }
        catch(e) {
            console.log(`Failed to delete user with id: ${userDTO.userId}`, e);
            return Result.failure(new Error("Failed to delete user"));
        }
    }

    static async userExists(userDTO: UserDTO) {
        try {
            const user = await User.findOne({ 
                where: { userId: userDTO.userId.toString() } 
            });
            return Result.success(user != null);
        }
        catch(e) {
            console.log(`Error checking user existence for id: ${userDTO.userId}`, e);
            return Result.failure(new Error("Error checking user existence"));
        }
    }

    // Aggiungo un metodo per ottenere l'utente completo come DTO
    static async getUser(userDTO: UserDTO) {
        try {
            const user = await User.findOne({ 
                where: { userId: userDTO.userId.toString() } 
            });
            
            if (!user) {
                return Result.failure(new Error("User not found"));
            }

            return Result.success(new UserDTO(user.userId));
        }
        catch(e) {
            console.log(`Error fetching user with id: ${userDTO.userId}`, e);
            return Result.failure(new Error("Error fetching user"));
        }
    }
}