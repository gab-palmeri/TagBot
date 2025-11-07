import { Group } from '@db/entity/Group';
import { GroupDTO } from '../group/group.dto';

export default class AdminRepository {
    
    static async getGroupsByAdmin(userId: string) {
        try {
            const groups = await Group.find({ 
                relations: ["admins"], 
                where: { admins: { userId: userId } } 
            });

            return groups.map(group => new GroupDTO(
                group.groupId,
                group.groupName,
                group.canCreate,
                group.canDelete,
                group.canRename,
                group.isActive
            ));
        }
        catch(error) {
            console.log(error);
            return null;
        }
    }
    
    static async editGroupPermissions(groupId: string, userId: string, permissions: Partial<GroupDTO>) {
        try {
            // Select the group from the database
            const group = await Group.findOne({
                relations: ["admins"], 
                where: { groupId: groupId }
            });

            if(!group) {
                return "This group doesn't exist";
            }

            // Check if the user is an admin of the group
            const isAdmin = group.admins.find(admin => admin.userId === userId);
            if(!isAdmin) {
                return "You are not an admin of this group";
            }

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

            return updatedGroupDto;
        }
        catch(error) {
            console.log(error);
            return "An error occurred";
        }
    }
}