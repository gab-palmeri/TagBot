import { User } from "../../entity/User";


//given an userid, save it to the db
export async function saveUser(userId: string) {
    //note: userId is unique, so saving might crash
    try {
        const user = new User();
        user.userId = userId;
        await user.save();
    }
    catch(e) {
        console.log("tried to add user with id: " + userId + " but it already exists (it can happen)");
    }
}

//given an userid, remove it from the db
export async function deleteUser(userId: string) {
    await User.delete({userId: userId});
}

//given an userid, check if it's in the db
export async function userExists(userId: string) {
    const user = await User.findOne({where: {userId: userId}});
    return user != null;
}
