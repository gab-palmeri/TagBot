import { Result } from "shared/result";
import { UserDTO } from "./user.dto";

export interface IUserRepository {
  saveUser(userId: string, username: string): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;
  deleteUser(userId: string): Promise<Result<null, "DB_ERROR">>;
  userExists(userId: string): Promise<Result<boolean, "DB_ERROR">>;
  getUser(userId: string): Promise<Result<UserDTO, "NOT_FOUND" | "DB_ERROR">>;
  updateUserUsername(userId: string, username: string): Promise<Result<null, "DB_ERROR">>;
  setBotStarted(userId: string, hasBotStarted: boolean): Promise<Result<null, "DB_ERROR">>;
}

export interface IUserService {
  saveUser(userId: string, username: string): Promise<Result<null, "ALREADY_EXISTS" | "INTERNAL_ERROR">>;
  deleteUser(userId: string): Promise<Result<null, "INTERNAL_ERROR">>;
  userExists(userId: string): Promise<Result<boolean, "INTERNAL_ERROR">>;
  getUser(userId: string): Promise<Result<UserDTO, "NOT_FOUND" | "INTERNAL_ERROR">>;
  updateUserUsername(userId: string, username: string): Promise<Result<null, "INTERNAL_ERROR">>;
  setBotStarted(userId: string, hasBotStarted: boolean): Promise<Result<null, "INTERNAL_ERROR">>;
}