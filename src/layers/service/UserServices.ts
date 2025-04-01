import UserRepository from "@repository/UserRepository";
import { UserDTO } from "@dto/UserDTO";

export default class UserServices {
    //given an userid, save it to the db
    static async saveUser(userId: string) {
        const userDTO = new UserDTO(userId);
        return await UserRepository.saveUser(userDTO);
    }

    //given an userid, remove it from the db
    static async deleteUser(userId: string) {
        const userDTO = new UserDTO(userId);
        return await UserRepository.deleteUser(userDTO);
    }

    //given an userid, check if it's in the db
    static async userExists(userId: string) {
        const userDTO = new UserDTO(userId);
        return await UserRepository.userExists(userDTO);
    }
}
