import { Result } from "@utils/result";
import { AdminDTO } from "./admin.dto";
import { GroupDTO } from "@db/group/group.dto";

export interface IAdminRepository {
    
    addAdmins(groupId: string, userIds: string[]): Promise<Result<null, "DB_ERROR">>;
    deleteAdmins(groupId: string, userIds: string[]): Promise<Result<null, "DB_ERROR">>;
    deleteAllAdmins(groupId: string): Promise<Result<null, "DB_ERROR">>;
    getWithGroups(userId: string): Promise<Result<AdminDTO, "DB_ERROR">>;
    editGroupPermissions(groupId: string, permissions: Partial<GroupDTO>): Promise<Result<null, "DB_ERROR">>;
}