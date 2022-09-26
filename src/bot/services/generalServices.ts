import { Group } from "../../entity/Group";
import { Admin } from "../../entity/Admin";

export async function createGroup(groupId: number, adminList: number[]) {
	try {
		let group = new Group();
		group.groupId = groupId;

		group.admins = adminList.map((userId) => {
			const admin = new Admin();
			admin.userId = userId;
			return admin;
		});

		group = await group.save();
		return { state: "ok", message: null };
	}
	catch (error) {

		await loadAdminList(groupId, adminList);

		const response =
			error.code == "ER_DUP_ENTRY"
				? { state: "ALREADY_EXISTS", message: "This group already exists" }
				: { state: "error", message: "An error occured" };
		return response;
	}
}

export async function migrateGroup(oldGroupId: number, newGroupId: number) {
	try {
		const group = await Group.findOne({where: {groupId: oldGroupId}});
		if (!group) {
			return { state: "NOT_FOUND", message: "Group not found" };
		}
		group.groupId = newGroupId;
		await group.save();
		return { state: "ok", message: null };
	}
	catch (err) {
		return { state: "error", message: err.message };
	}
}

export async function loadAdminList(groupId: number, adminList: number[]) {
	try {
		const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
		if (!group) {
			return { state: "NOT_FOUND", message: "Group not found" };
		}

		//add all the new admins
		const newAdmins = adminList.filter((userId) => {
			return !group.admins.find((admin) => admin.userId == userId);
		});

		group.admins = group.admins.concat(
			newAdmins.map((userId) => {
				const admin = new Admin();
				admin.userId = userId;
				return admin;
			})
		);

		await group.save();
		return { state: "ok", message: null };
	}
	catch (err) {
		return { state: "error", message: err.message };
	}
}

export async function addAdmin(groupId: number, userId: number) {
	try {
		const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
		if (!group) {
			return { state: "NOT_FOUND", message: "Group not found" };
		}

		const admin = new Admin();
		admin.userId = userId;
		group.admins.push(admin);
		await group.save();
		return { state: "ok", message: null };
	}
	catch (err) {
		return { state: "error", message: err.message };
	}
}

export async function removeAdmin(groupId: number, userId: number) {
	try {
		const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
		if (!group) {
			return { state: "GROUP_NOT_FOUND", message: "Group not found" };
		}

		const toDeleteAdmin = group.admins.find((admin) => admin.userId == userId);
		if (!toDeleteAdmin) {
			return { state: "ADMIN_NOT_FOUND", message: "Admin not found" };
		}

		await toDeleteAdmin.remove();

		return { state: "ok", message: null };
	}
	catch (err) {
		return { state: "error", message: err.message };
	}
}