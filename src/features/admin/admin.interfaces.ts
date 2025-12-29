import { Result } from "shared/result";
import { AdminDTO } from "./admin.dto";
import { GroupDTO } from "features/group/group.dto";

export interface IAdminRepository {
    
    addAdmins(groupId: string, userIds: string[]): Promise<Result<null, "DB_ERROR">>;
    deleteAdmins(groupId: string, userIds: string[]): Promise<Result<null, "DB_ERROR">>;
    deleteAllAdmins(groupId: string): Promise<Result<null, "DB_ERROR">>;
    getWithGroups(userId: string): Promise<Result<AdminDTO, "DB_ERROR">>;
    editGroupPermissions(groupId: string, permissions: Partial<GroupDTO>): Promise<Result<null, "DB_ERROR">>;
}

export interface IAdminServices {
    
    addAdmins(groupId: string, userIds: string[]): Promise<Result<null, "INTERNAL_ERROR">>;
    removeAdmins(groupId: string, userIds: string[]): Promise<Result<null, "INTERNAL_ERROR">>;
    reloadAdmins(groupId: string, userIds: string[]): Promise<Result<null, "INTERNAL_ERROR">>;
    deleteAllAdmins(groupId: string): Promise<Result<null, "INTERNAL_ERROR">>;
    getAdminGroups(userId: string): Promise<Result<GroupDTO[], "NO_CONTENT" | "INTERNAL_ERROR">>;
    editGroupPermissions(groupId: string, userId: string, permissions: Partial<GroupDTO>): Promise<Result<null, "NOT_FOUND" | "FORBIDDEN" | "INTERNAL_ERROR">>;
}