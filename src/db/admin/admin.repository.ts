import { IAdminRepository } from './admin.interfaces';
import { AdminDTO } from './admin.dto';
import { GroupDTO } from '../group/group.dto';
import { getDb } from '@db/database';

export default class AdminRepository implements IAdminRepository {
    
    public async getWithGroups(userId: string) {
        const admin = await getDb()
            .selectFrom('admin')
            .leftJoin('group', 'admin.groupId', 'group.groupId')
            .where('admin.userId', '=', userId)
            .selectAll()
            .execute();

        const groups = admin.map(a => new GroupDTO(
            a.groupId,
            a.groupName,
            a.canCreate,
            a.canDelete,
            a.canRename,
            a.isActive
        ));
        
        return new AdminDTO(userId, groups);
    }
    
    public async editGroupPermissions(groupId: string, permissions: Partial<GroupDTO>) {
        await getDb()
            .updateTable('group')
            .set(permissions)
            .where('groupId', '=', groupId)
            .execute();
    }

    public async addAdmins(groupId: string, userIds: string[]) {
        const inserts = userIds.map(userId => ({
            groupId,
            userId
        }));
        await getDb()
            .insertInto('admin')
            .values(inserts)
            .execute();
    }

    public async deleteAdmins(groupId: string, userIds: string[]) {
        await getDb()
            .deleteFrom('admin')
            .where('groupId', '=', groupId)
            .where('userId', 'in', userIds)
            .execute();
    }

    public async deleteAllAdmins(groupId: string) {
        await getDb()
            .deleteFrom('admin')
            .where('groupId', '=', groupId)
            .execute();
    }
}
