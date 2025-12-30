import { Result } from "@utils/result";
import { UserDTO } from "./user.dto";

export interface IUserRepository {
  saveUser(userId: string, username: string): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;
  deleteUser(userId: string): Promise<Result<null, "DB_ERROR">>;
  userExists(userId: string): Promise<Result<boolean, "DB_ERROR">>;
  getUser(userId: string): Promise<Result<UserDTO, "NOT_FOUND" | "DB_ERROR">>;
  updateUserUsername(userId: string, username: string): Promise<Result<null, "DB_ERROR">>;
  setBotStarted(userId: string, hasBotStarted: boolean): Promise<Result<null, "DB_ERROR">>;
}