// group.repository.interface.ts
import { Result } from "shared/result";
import { GroupDTO } from "./group.dto";

export interface IGroupRepository {
  createGroup(groupID: string, groupName: string): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;
  getGroup(groupID: string): Promise<Result<GroupDTO, "NOT_FOUND" | "DB_ERROR">>;
  migrateGroup(oldGroupID: string, newGroupID: string): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
  setGroupActive(groupID: string, isActive: boolean): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
}

export interface IGroupService {
  createGroup(groupName: string, groupID: string): Promise<Result<null, "ALREADY_EXISTS" | "INTERNAL_ERROR">>;
  getGroup(groupID: string): Promise<Result<GroupDTO, "NOT_FOUND" | "INTERNAL_ERROR">>;
  handleBotChange(oldStatus: string, newStatus: string): Promise<Result<"BOT_ADDED" | "BOT_PROMOTED" | "BOT_KICKED", "UNKNOWN_EVENT">>;
  handleMemberChange(oldStatus: string, newStatus: string): Promise<Result<"ADD_ADMIN" | "REMOVE_ADMIN" | "NO_EVENT", null>>;
  migrateGroup(oldGroupID: string, newGroupID: string): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;
  setGroupActive(groupID: string, isActive: boolean): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;
}
