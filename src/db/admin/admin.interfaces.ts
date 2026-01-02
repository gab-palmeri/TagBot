import { AdminDTO } from "./admin.dto";
import { GroupDTO } from "@db/group/group.dto";

export interface IAdminRepository {
    
    addAdmins(groupId: string, userIds: string[])
    deleteAdmins(groupId: string, userIds: string[])
    deleteAllAdmins(groupId: string)
    getWithGroups(userId: string): Promise<AdminDTO>;
    editGroupPermissions(groupId: string, permissions: Partial<GroupDTO>)
}