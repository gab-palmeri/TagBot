import { GroupDTO } from '../group/group.dto';

import AdminRepository from './admin.repository';

export default class AdminServices {
    
    static async getAdminGroups(userId: string): Promise<string | GroupDTO[]> {		
        
        const groups = await AdminRepository.getGroupsByAdmin(userId);
        if(groups.length == 0) {
            return 'You are not an admin of any group';
        }
        if(groups == null) {
            return 'An error occurred while fetching your admin groups';
        }

        return groups;
    }
    
    static async editGroupPermissions(groupId: string, userId: string, permissions: object) {
        return await AdminRepository.editGroupPermissions(groupId, userId, permissions);
    }
}

