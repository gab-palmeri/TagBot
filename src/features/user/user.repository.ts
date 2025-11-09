import { User } from "@db/entity/User";
import { IUserRepository } from "./user.interfaces";
import { ok, err } from "shared/result";

export default class UserRepository implements IUserRepository {
    
    public async saveUser(userId: string) {
        try {
            const user = new User();
            user.userId = userId.toString();
            await user.save();

            return ok(null);
        }
        catch(e) {
            console.log(`User with id: ${userId} already exists (expected in normal operation)`);
            return err("ALREADY_EXISTS");
        }
    }

    public async deleteUser(userId: string)  {
        try {
            await User.delete({ userId: userId.toString() });
            return ok(null);
        }
        catch(e) {
            console.log(`Failed to delete user with id: ${userId}`, e);
            return err("DB_ERROR");
        }
    }

    public async userExists(userId: string) {
        try {
            const user = await User.findOne({ 
                where: { userId: userId.toString() } 
            });
            return ok(user != null);
        }
        catch(e) {
            console.log(`Error checking user existence for id: ${userId}`, e);
            return err("DB_ERROR");
        }
    }

    public async getUserId(userId: string) {
        try {
            const user = await User.findOne({ 
                where: { userId: userId.toString() } 
            });
            
            if (!user) {
                return err("NOT_FOUND");
            }

            return ok(user.id);
        }
        catch(e) {
            console.log(`Error fetching user with id: ${userId}`, e);
            return err("DB_ERROR");
        }
    }
}