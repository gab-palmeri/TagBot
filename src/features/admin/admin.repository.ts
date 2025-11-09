import { GroupDTO } from '../group/group.dto';
import { ok, err } from 'shared/result';
import { AdminDTO } from './admin.dto';
import { IAdminRepository } from './admin.interfaces';
import { Group } from '@db/entity/Group';

export default class AdminRepository implements IAdminRepository {
    
    public async getAdminWithGroups(userId: string) {
        try {

            const groups = await Group.find({
                relations: ["admins"], 
                where: { admins: { userId: userId } } 
            });
            
            return ok(new AdminDTO(
                userId,
                groups.map(group => new GroupDTO(
                    group.groupId,
                    group.groupName,
                    group.canCreate,
                    group.canDelete,
                    group.canRename,
                    group.isActive
                ))
            ));
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async getGroupsByAdmin(userId: string) {
        try {
            const groups = await Group.find({ 
                relations: ["admins"], 
                where: { admins: { userId: userId } } 
            });

            const adminGroups = groups.map(group => new GroupDTO(
                group.groupId,
                group.groupName,
                group.canCreate,
                group.canDelete,
                group.canRename,
                group.isActive
            ));

            return ok(adminGroups);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
    
    public async editGroupPermissions(groupId: string, userId: string, permissions: Partial<GroupDTO>) {
        try {
            // Select the group from the database
            const group = await Group.findOne({
                relations: ["admins"], 
                where: { groupId: groupId }
            });

            // Update permissions
            for (const [key, value] of Object.entries(permissions)) {
                if (key in group) {
                    group[key] = value;
                }
            }

            await group.save();

            // Return the updated group as DTO
            const updatedGroupDto = new GroupDTO(
                group.groupId,
                group.groupName,
                group.canCreate,
                group.canDelete,
                group.canRename,
                group.isActive
            );

            return ok(updatedGroupDto);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
}