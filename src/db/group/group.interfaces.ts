// group.repository.interface.ts
import { Result } from "@utils/result";
import { GroupDTO } from "./group.dto";

export interface IGroupRepository {
  createGroup(groupID: string, groupName: string): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;
  getGroup(groupID: string): Promise<Result<GroupDTO, "NOT_FOUND" | "DB_ERROR">>;
  migrateGroup(oldGroupID: string, newGroupID: string): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
  setGroupActive(groupID: string, isActive: boolean): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;
}
