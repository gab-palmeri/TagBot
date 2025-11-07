import { User } from "@db/entity/User";
import { RepoResponseStatus } from "shared/enums";

export default class UserRepository {
    
    static async saveUser(userId: string): Promise<RepoResponseStatus>{
        try {
            const user = new User();
            user.userId = userId.toString();
            await user.save();

            return RepoResponseStatus.SUCCESS;
        }
        catch(e) {
            console.log(`User with id: ${userId} already exists (expected in normal operation)`);
            return RepoResponseStatus.ALREADY_EXISTS;
        }
    }

    static async deleteUser(userId: string): Promise<RepoResponseStatus> {
        try {
            await User.delete({ userId: userId.toString() });
            return RepoResponseStatus.SUCCESS;
        }
        catch(e) {
            console.log(`Failed to delete user with id: ${userId}`, e);
            return RepoResponseStatus.ERROR;
        }
    }

    static async userExists(userId: string): Promise<RepoResponseStatus | boolean> {
        try {
            const user = await User.findOne({ 
                where: { userId: userId.toString() } 
            });
            return user != null;
        }
        catch(e) {
            console.log(`Error checking user existence for id: ${userId}`, e);
            return RepoResponseStatus.ERROR;
        }
    }

    static async getUser(userId: string): Promise<RepoResponseStatus | number> {
        try {
            const user = await User.findOne({ 
                where: { userId: userId.toString() } 
            });
            
            if (!user) {
                return RepoResponseStatus.NOT_FOUND;
            }

            return user.id;
        }
        catch(e) {
            console.log(`Error fetching user with id: ${userId}`, e);
            return RepoResponseStatus.ERROR;
        }
    }
}