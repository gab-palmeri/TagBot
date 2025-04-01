import GroupRepository from "@repository/GroupRepository";

import { Result } from "@utils/Result";
import { GroupDTO } from "@dto/GroupDTO";
import { AdminDTO } from "@dto/AdminDTO";

export default class GroupServices {
	static async createGroup(groupName: string, groupId: string, adminList: number[]) {

		try {
			const groupDTO = new GroupDTO(groupId, groupName);

			const adminsDTOS = adminList.map((userId) => {
				const admin = new AdminDTO(userId.toString());
				return admin;
			});

			//Create group with admins
			const result = await GroupRepository.createGroup(groupDTO, adminsDTOS);

			//If group already exists, just create admin list
			if(result.isFailure()) {
				if(result.error.message === "ALREADY_EXISTS") {
					await GroupServices.createAdminList(groupId, adminList);
					return Result.failure(new Error("ALREADY_EXISTS"));
				}
				else {
					return Result.failure(new Error("An error occurred"));
				}
			}
			
			return result;
		}
		catch(error) {
			return Result.failure(error);
		}
	}
	
	static async migrateGroup(oldGroupId: string, newGroupId: string) {

		const oldGroupDTO = new GroupDTO(oldGroupId, "");
		const newGroupDTO = new GroupDTO(newGroupId, "");
		const result = await GroupRepository.migrateGroup(oldGroupDTO, newGroupDTO);
		return result;
	}

	static async toggleGroupActive(groupId: string) {

		const groupDTO = new GroupDTO(groupId, "");
		
		const result = await GroupRepository.toggleGroupActive(groupDTO);
		return result;
	}

	
	static async createAdminList(groupId: string, adminList: number[]) {

		const groupDTO = new GroupDTO(groupId, "");
		const adminsDTOS = adminList.map((userId) => {
			const admin = new AdminDTO(userId.toString());
			return admin;
		});
		
		const result = await GroupRepository.createAdminList(groupDTO, adminsDTOS);
		return result;
		
	}

	static async deleteAdminList(groupId: string) {
		const groupDTO = new GroupDTO(groupId, "");
		
		const result = await GroupRepository.deleteAdminList(groupDTO);
		return result;
	}

	static async reloadAdminList(groupId: string, adminList: number[]) {
		const groupDTO = new GroupDTO(groupId, "");
		const adminsDTOS = adminList.map((userId) => {
			const admin = new AdminDTO(userId.toString());
			return admin;
		});
		
		const result = await GroupRepository.reloadAdminList(groupDTO, adminsDTOS);
		return result;
	}
	
	static async addAdmin(groupId: string, userId: number) {

		const groupDTO = new GroupDTO(groupId, "");
		const adminDTO = new AdminDTO(userId.toString());
		
		const result = await GroupRepository.addAdmin(groupDTO, adminDTO);
		return result;
	}
	
	static async removeAdmin(groupId: string, userId: number) {
		const groupDTO = new GroupDTO(groupId, "");
		const adminDTO = new AdminDTO(userId.toString());
		
		const result = await GroupRepository.removeAdmin(groupDTO, adminDTO);
		return result;
	}
}

