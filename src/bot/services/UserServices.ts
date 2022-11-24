import { User } from "../../entity/User";

export default class UserServices {
    //given an userid, save it to the db
    static async saveUser(userId: string) {
        //note: userId is unique, so saving might crash
        try {
            const user = new User();
            user.userId = userId;
            await user.save();
        }
        catch(e) {
            console.log("Tried to add user with id: " + userId + " but it already exists (it can happen)");
        }
    }

    //given an userid, remove it from the db
    static async deleteUser(userId: string) {
        await User.delete({userId: userId});
    }

    //given an userid, check if it's in the db
    static async userExists(userId: string) {
        const user = await User.findOne({where: {userId: userId}});
        return user != null;
    }
}
