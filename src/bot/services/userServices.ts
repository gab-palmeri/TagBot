import { User } from "../../entity/User";


//given an userid, save it to the db
export async function saveUser(userId: number) {
    const user = new User();
    user.userId = userId.toString();
    await user.save();
}

//given an userid, remove it from the db
export async function deleteUser(userId: number) {
    await User.delete({userId: userId.toString()});
}

//given an userid, check if it's in the db
export async function userExists(userId: number) {
    const user = await User.findOne({where: {userId: userId.toString()}});
    return user != null;
}
