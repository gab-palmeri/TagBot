import { IGroupRepository } from "./group.interfaces";
import { GroupDTO } from "./group.dto";
import { getDb } from '@db/database';

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
            groupId: group.groupId,
            groupName: group.groupName,
            canCreate: group.canCreate,
            canDelete: group.canDelete,
            canRename: group.canRename,
            isActive: group.isActive,
        };
        return groupDTO;
    }
    
    public async migrateGroup(oldGroupId: string, newGroupId: string) {
        await getDb().updateTable('group')
            .set({ groupId: newGroupId })
            .where('groupId', '=', oldGroupId)
            .executeTakeFirst();
    }

    public async setGroupActive(groupId: string, isActive: boolean) {
        await getDb()
            .updateTable('group')
            .set(() => ({
                isActive: isActive,
            }))
            .where('groupId', '=', groupId)
            .execute();
    }
}
