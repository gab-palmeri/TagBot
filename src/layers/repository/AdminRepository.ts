import { Group } from '@db/entity/Group';
import { Result } from '@utils/Result';
import { AdminDTO } from '@dto/AdminDTO';
import { GroupDTO } from '@dto/GroupDTO';

export default class AdminRepository {
    
    static async getGroupsByAdmin(adminDTO: AdminDTO) {
        try {
            const groups = await Group.find({ 
                relations: ["admins"], 
                where: { admins: { userId: adminDTO.userId } } 
            });

            return Result.success(groups.map(group => new GroupDTO(
                group.groupId,
                group.groupName,
                group.canCreate,
                group.canDelete,
                group.canRename,
                group.isActive
            )));
        }
        catch(error) {
            console.log(error);
            return Result.failure(new Error('An error occurred'));
        }
    }
    
    static async editGroupPermissions(groupDTO: GroupDTO, adminDTO: AdminDTO, permissions: Partial<GroupDTO>) {
        try {
            // Select the group from the database
            const group = await Group.findOne({
                relations: ["admins"], 
                where: { groupId: groupDTO.groupId }
            });

            if(!group) {
                return Result.failure(new Error("This group doesn't exist"));
            }

            // Check if the user is an admin of the group
            const isAdmin = group.admins.find(admin => admin.userId === adminDTO.userId);
            if(!isAdmin) {
                return Result.failure(new Error("You are not an admin of this group"));
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

            return Result.success(updatedGroupDto);
        }
        catch(error) {
            console.log(error);
            return Result.failure(new Error('An error occurred'));
        }
    }
}