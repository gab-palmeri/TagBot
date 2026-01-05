import { AdminDTO } from "./admin.dto";
import { GroupDTO } from "db/group/group.dto";

export interface IAdminRepository {
    
    addAdmins(group_id: number, userIds: string[])
    deleteAdmins(group_id: number, userIds: string[])
    deleteAllAdmins(group_id: number)
    getWithGroups(userId: string): Promise<AdminDTO>;
    editGroupPermissions(group_id: number, permissions: Partial<GroupDTO>)
}