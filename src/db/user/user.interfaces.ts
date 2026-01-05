import { UserDTO } from "./user.dto";

type EditableUserFields = Partial<
  Pick<UserDTO, "username" | "hasBotStarted" | "lang">
>;

export interface IUserRepository {
  saveUser(userId: string, username: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  getUser(userId: string): Promise<UserDTO>;
  update(userId: string, data: EditableUserFields): Promise<void>;
  getAllActiveUsers(): Promise<UserDTO[]>;
}
