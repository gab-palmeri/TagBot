import { Result } from "shared/result";
import { AdminDTO } from "./admin.dto";
import { GroupDTO } from "features/group/group.dto";

export interface IAdminRepository {
    
    getAdminWithGroups(userId: string): Promise<Result<AdminDTO, "DB_ERROR">>;

    getGroupsByAdmin(userId: string): Promise<Result<GroupDTO[], "DB_ERROR">>;
    
    editGroupPermissions(
        groupId: string, 
        userId: string, 
        permissions: Partial<GroupDTO>
    ): Promise<Result<null, "DB_ERROR">>;
}

export interface IAdminServices {
    
    getAdminGroups(userId: string): Promise<Result<GroupDTO[], "NO_CONTENT" | "INTERNAL_ERROR">>;
    
    editGroupPermissions(
        groupId: string, 
        userId: string, 
        permissions: object
    ): Promise<Result<null, "NOT_FOUND" | "FORBIDDEN" | "INTERNAL_ERROR">>;
}