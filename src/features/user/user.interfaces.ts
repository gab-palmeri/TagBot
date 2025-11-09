import { Result } from "shared/result";

export interface IUserRepository {
  saveUser(userId: string): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;
  deleteUser(userId: string): Promise<Result<null, "DB_ERROR">>;
  userExists(userId: string): Promise<Result<boolean, "DB_ERROR">>;
  getUserId(userId: string): Promise<Result<number, "NOT_FOUND" | "DB_ERROR">>;
}

export interface IUserService {
  saveUser(userId: string): Promise<Result<null, "ALREADY_EXISTS" | "INTERNAL_ERROR">>;
  deleteUser(userId: string): Promise<Result<null, "INTERNAL_ERROR">>;
  userExists(userId: string): Promise<Result<boolean, "INTERNAL_ERROR">>;
  getUser(userId: string): Promise<Result<number, "NOT_FOUND" | "INTERNAL_ERROR">>;
}