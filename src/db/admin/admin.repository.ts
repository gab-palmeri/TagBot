import { IAdminRepository } from './admin.interfaces';
import { AdminDTO } from './admin.dto';
import { GroupDTO } from '../group/group.dto';
import { getDb } from 'db/database';

export default class AdminRepository implements IAdminRepository {
    
    public async getWithGroups(userId: string) {
        const admin = await getDb()
            .selectFrom('admin')
            .leftJoin('group', 'admin.group_id', 'group.id')
            .where('admin.userId', '=', userId)
            .selectAll()
            .execute();

        const groups = admin.map(a => new GroupDTO(
            a.id,
            a.groupId,
            a.groupName,
            a.canCreate,
            a.canDelete,
            a.canRename,
            a.isActive,
            a.lang
        ));
        
        return new AdminDTO(userId, groups);
    }
    
    //TODO: move to group repository
    public async editGroupPermissions(group_id: number, permissions: Partial<GroupDTO>) {
        await getDb()
            .updateTable('group')
            .set(permissions)
            .where('id', '=', group_id)
            .execute();
    }

    public async addAdmins(group_id: number, userIds: string[]) {
        const inserts = userIds.map(userId => ({
            group_id,
            userId
        }));
        await getDb()
            .insertInto('admin')
            .values(inserts)
            .onConflict((oc) =>
                oc.columns(['group_id', 'userId']).doNothing()
            )
            .execute();
    }

    public async deleteAdmins(group_id: number, userIds: string[]) {
        await getDb()
            .deleteFrom('admin')
            .where('group_id', '=', group_id)
            .where('userId', 'in', userIds)
            .execute();
    }

    public async deleteAllAdmins(group_id: number) {
        await getDb()
            .deleteFrom('admin')
            .where('group_id', '=', group_id)
            .execute();
    }
}
