import { AdminDTO } from '@dto/AdminDTO';
import { GroupDTO } from '@dto/GroupDTO';

import AdminRepository from '@repository/AdminRepository';

export default class AdminServices {
	
	static async getAdminGroups(userId: string) {		
		const adminDTO = new AdminDTO(userId);
		return await AdminRepository.getGroupsByAdmin(adminDTO);
	}
	
	static async editGroupPermissions(groupId: string, userId: string, permissions: object) {
		const groupDTO = new GroupDTO(groupId, '');
		const adminDTO = new AdminDTO(userId);
		return await AdminRepository.editGroupPermissions(groupDTO, adminDTO, permissions);
	}
}

