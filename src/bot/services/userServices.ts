import { User } from "../../entity/User";


//given an userid, save it to the db
export async function saveUser(userId: string) {
    const user = new User();
    user.userId = userId;
    await user.save();
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
