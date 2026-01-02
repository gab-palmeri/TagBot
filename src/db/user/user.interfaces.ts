import { UserDTO } from "./user.dto";

export interface IUserRepository {
  saveUser(userId: string, username: string)
  deleteUser(userId: string)
  getUser(userId: string): Promise<UserDTO>;
  updateUserUsername(userId: string, username: string)
  setBotStarted(userId: string, hasBotStarted: boolean)
}