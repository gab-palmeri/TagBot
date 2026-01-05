import { IGroupRepository } from "./group.interfaces";
import { GroupDTO } from "./group.dto";
import { getDb } from 'db/database';

export default class GroupRepository implements IGroupRepository {

    public async createGroup(groupId: string, groupName: string) {
        await getDb().insertInto('group')
            .values({
                groupId: groupId,
                groupName: groupName,
            })
            .execute();
    }

    public async getGroup(groupID: string) {
        const group = await getDb().selectFrom('group')
            .selectAll()
            .where('groupId', '=', groupID)
            .executeTakeFirst();

        if (!group) {
            return null;
        }

        const groupDTO: GroupDTO = {
            id: group.id,
            groupId: group.groupId,
            groupName: group.groupName,
            canCreate: group.canCreate,
            canDelete: group.canDelete,
            canRename: group.canRename,
            isActive: group.isActive,
            lang: group.lang
        };
        return groupDTO;
    }
    
    public async migrateGroup(oldGroupId: string, newGroupId: string) {
        await getDb().updateTable('group')
            .set({ groupId: newGroupId })
            .where('groupId', '=', oldGroupId)
            .executeTakeFirst();
    }

    public async getAllActiveGroups() {
        const groups = await getDb()
            .selectFrom('group')
            .selectAll()
            .where('isActive', '=', true)
            .execute();
        return groups.map(group => new GroupDTO(
            group.id, group.groupId, group.groupName, group.canCreate, group.canDelete, group.canRename, group.isActive, group.lang
        ));
    }

    public async update(groupID: string, fields: Partial<Pick<GroupDTO, "groupName" | "isActive" | "lang">>) {
        await getDb()
            .updateTable('group')
            .set(fields)
            .where('groupId', '=', groupID)
            .execute();
    }
}
