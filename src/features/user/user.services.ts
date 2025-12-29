import { IUserRepository, IUserService } from "./user.interfaces";
import { ok, err } from "shared/result";

export default class UserServices implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  public async saveUser(userId: string, username: string) {
    const result = await this.userRepository.saveUser(userId, username);

    if (result.ok === false) {
      switch (result.error) {
        case "ALREADY_EXISTS":
          return err("ALREADY_EXISTS");
        default:
          return err("INTERNAL_ERROR");
      }
    }

    return ok(null);
  }

  public async deleteUser(userId: string) {
    const result = await this.userRepository.deleteUser(userId);

    if (result.ok === false) {
        return err("INTERNAL_ERROR");
    }
    return ok(null);
  }

  public async userExists(userId: string) {
    const result = await this.userRepository.userExists(userId);

    if (result.ok === false) {
        return err("INTERNAL_ERROR");
    }
    return ok(result.value);
  }

  public async getUser(userId: string) {
    const result = await this.userRepository.getUser(userId);

    if (result.ok === false) {
      switch (result.error) {
        case "NOT_FOUND":
          return err("NOT_FOUND");
        case "DB_ERROR":
        default:
          return err("INTERNAL_ERROR");
      }
    }

    return ok(result.value);
  }

  public async updateUserUsername(userId: string, username: string) {
    const result = await this.userRepository.updateUserUsername(userId, username);

    if (result.ok === false) {
        return err("INTERNAL_ERROR");
    }
    return ok(null);
  }

  public async setBotStarted(userId: string, hasBotStarted: boolean) {
    const result = await this.userRepository.setBotStarted(userId, hasBotStarted);

    if (result.ok === false) {
        return err("INTERNAL_ERROR");
    }
    return ok(null);
  }
}
