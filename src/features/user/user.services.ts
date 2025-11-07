import UserRepository from "./user.repository";

export default class UserServices {
    //given an userid, save it to the db
    static async saveUser(userId: string) {
        return await UserRepository.saveUser(userId);
    }

    //given an userid, remove it from the db
    static async deleteUser(userId: string) {
        return await UserRepository.deleteUser(userId);
    }

    //given an userid, check if it's in the db
    static async userExists(userId: string) {
        return await UserRepository.userExists(userId);
    }
}
