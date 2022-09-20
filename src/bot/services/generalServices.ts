import { Group } from "../../entity/Group";

export async function migrateGroup(oldGroupId: number, newGroupId: number) {
	const group = await Group.findOne({where: {groupId: oldGroupId}});
	if (!group) {
		return { state: "NOT_FOUND", message: "Group not found" };
	}
	group.groupId = newGroupId;
	await group.save();
	return { state: "ok", message: null };
}