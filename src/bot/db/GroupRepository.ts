import { Group } from "../../entity/Group";
import { Admin } from "../../entity/Admin";
import { GroupDTO } from "../dtos/GroupDTO";
import { AdminDTO } from "../dtos/AdminDTO";

import { Result } from "../utils/Result";

export default class GroupRepository {
	static async createGroup(groupDTO: GroupDTO, adminsDTOS: AdminDTO[]) {
		try {
			let group = new Group();
			group.groupName = groupDTO.groupName;
			group.groupId = groupDTO.groupId;
	
			group.admins = adminsDTOS.map((adminDTO) => {
				const admin = new Admin();
				admin.userId = adminDTO.userId;
				return admin;
			});
	
			group = await group.save();
			return Result.success();
		}
		catch (error) {

			if(error.code === "ER_DUP_ENTRY") {

				await GroupRepository.createAdminList(groupDTO, adminsDTOS);

				return Result.failure(new Error("This group already exists"));
			}
			else {
				return Result.failure(new Error("An error occurred"));
			}
		}
	}
	
	static async migrateGroup(oldGroupDTO: GroupDTO, newGroupDTO: GroupDTO) {
		try {
			const group = await Group.findOne({where: {groupId: oldGroupDTO.groupId}});
			if (!group) {
				return Result.failure(new Error("Group not found"));
			}
			group.groupId = newGroupDTO.groupId;
			await group.save();
			return Result.success();
		}
		catch (err) {
			return Result.failure(new Error(err.message));
		}
	}

	static async toggleGroupActive(groupDTO: GroupDTO) {
		try {
			const group = await Group.findOne({where: {groupId: groupDTO.groupId}});
			if (!group) {
				return Result.failure(new Error("Group not found"));
			}
			group.isActive = !group.isActive;
			await group.save();
			return Result.success();
		}
		catch (err) {
			return Result.failure(new Error("An error occurred"));
		}
	}

	
	static async createAdminList(groupDTO: GroupDTO, adminsDTOS: AdminDTO[]) {
		try {
			const group = await Group.findOne({ where: { groupId: groupDTO.groupId }, relations: ["admins"] });
			if (!group) {
				return Result.failure(new Error("Group not found"));
			}
	
			group.admins = group.admins.concat(
				adminsDTOS.map((adminDTO) => {
					const admin = new Admin();
					admin.userId = adminDTO.userId;
					return admin;
				})
			);
	
			await group.save();
			return Result.success();
		}
		catch (err) {
			return Result.failure(new Error("An error occurred"));
		}
	}

	static async deleteAdminList(groupDTO: GroupDTO) {
		try {
			const group = await Group.findOne({ where: { groupId: groupDTO.groupId }, relations: ["admins"] });
			if (!group) {
				return Result.failure(new Error("Group not found"));
			}
			
			await Admin.remove(group.admins);

			return Result.success();
		}
		catch (err) {
			return Result.failure(new Error("An error occurred"));
		}
	}

	static async reloadAdminList(groupDTO: GroupDTO, adminsDTOS: AdminDTO[]) {
		try {
			const group = await Group.findOne({ where: { groupId: groupDTO.groupId }, relations: ["admins"] });
			if (!group) {
				return Result.failure(new Error("Group not found"));
			}
	
			//add all the new admins
			const newAdminsDTOS = adminsDTOS.filter((adminDTO) => {
				return !group.admins.find((admin) => admin.userId == adminDTO.userId);
			});
	
			group.admins = group.admins.concat(
				newAdminsDTOS.map((adminDTO) => {
					const admin = new Admin();
					admin.userId = adminDTO.userId;
					return admin;
				})
			);
	
			await group.save();
			return Result.success();
		}
		catch (err) {
			return Result.failure(new Error("An error occurred"));
		}
	}
	
	static async addAdmin(groupDTO: GroupDTO, adminDTO: AdminDTO) {
		try {
			const group = await Group.findOne({ where: { groupId: groupDTO.groupId }, relations: ["admins"] });
			if (!group) {
				return Result.failure(new Error("Group not found"));
			}
	
			const admin = new Admin();
			admin.userId = adminDTO.userId;
			group.admins.push(admin);
			await group.save();
			return Result.success();
		}
		catch (err) {
			return Result.failure(new Error("An error occurred"));
		}
	}
	
	static async removeAdmin(groupDTO: GroupDTO, adminDTO: AdminDTO) {
		try {
			const group = await Group.findOne({ where: { groupId: groupDTO.groupId }, relations: ["admins"] });
			if (!group) {
				return Result.failure(new Error("Group not found"));
			}
	
			const toDeleteAdmin = group.admins.find((admin) => admin.userId == adminDTO.userId);
			if (!toDeleteAdmin) {
				return Result.failure(new Error("Admin not found"));
			}
	
			await toDeleteAdmin.remove();
	
			return Result.success();
		}
		catch (err) {
			return Result.failure(new Error("An error occurred"));
		}
	}
}

