// group.repository.interface.ts
import { Result } from "shared/result";

export interface IGroupRepository {
  createGroup(
    groupID: string,
    groupName: string,
    adminsIDs: string[]
  ): Promise<Result<null, "ALREADY_EXISTS" | "DB_ERROR">>;

  migrateGroup(
    oldGroupID: string,
    newGroupID: string
  ): Promise<Result<null, "NOT_FOUND" | "DB_ERROR">>;

  toggleGroupActive(
    groupID: string
  ): Promise<Result<null,  "NOT_FOUND" | "DB_ERROR">>;

  createAdminList(
    groupID: string,
    adminsIDs: string[]
  ): Promise<Result<null,  "DB_ERROR">>;

  deleteAdminList(
    groupID: string
  ): Promise<Result<null,  "DB_ERROR">>;

  reloadAdminList(
    groupID: string,
    adminsIDs: string[]
  ): Promise<Result<null,  "DB_ERROR">>;

  addAdmin(
    groupID: string,
    adminID: string
  ): Promise<Result<null,  "DB_ERROR">>;

  removeAdmin(
    groupID: string,
    adminID: string
  ): Promise<Result<null,  "DB_ERROR">>;
}

export interface IGroupService {
  createGroup(
    groupName: string,
    groupID: string,
    adminIDs: string[]
  ): Promise<Result<null, "ALREADY_EXISTS" | "INTERNAL_ERROR">>;

  handleBotChange(
    oldStatus: string,
    newStatus: string
  ): Promise<Result<"BOT_ADDED" | "BOT_PROMOTED" | "BOT_KICKED", "UNKNOWN_EVENT">>;

  handleMemberChange(
    oldStatus: string,
    newStatus: string
  ): Promise<Result<"ADD_ADMIN" | "REMOVE_ADMIN" | "NO_EVENT", null>>;

  migrateGroup(
    oldGroupID: string,
    newGroupID: string
  ): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;

  toggleGroupActive(
    groupID: string
  ): Promise<Result<null, "NOT_FOUND" | "INTERNAL_ERROR">>;

  createAdminList(
    groupID: string,
    adminsIDs: string[]
  ): Promise<Result<null, "INTERNAL_ERROR">>;

  deleteAdminList(
    groupID: string
  ): Promise<Result<null, "INTERNAL_ERROR">>;

  reloadAdminList(
    groupID: string,
    adminsIDs: string[]
  ): Promise<Result<null, "INTERNAL_ERROR">>;

  addAdmin(
    groupID: string,
    userID: string
  ): Promise<Result<null, "INTERNAL_ERROR">>;

  removeAdmin(
    groupID: string,
    userID: string
  ): Promise<Result<null, "INTERNAL_ERROR">>;
}

