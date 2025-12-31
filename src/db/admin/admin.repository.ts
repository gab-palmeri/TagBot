import { IAdminRepository } from './admin.interfaces';

import { ok, err } from '@utils/result';
import { AdminDTO } from './admin.dto';
import { GroupDTO } from '../group/group.dto';

import { getDb } from '@db/database';

export default class AdminRepository implements IAdminRepository {
    
    public async getWithGroups(userId: string) {
        try {

            //get admin with groups
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
            
            return ok(new AdminDTO(userId, groups));
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }
    
    public async editGroupPermissions(groupId: string, permissions: Partial<GroupDTO>) {
        try {
            await getDb()
                .updateTable('group')
                .set(permissions)
                .where('groupId', '=', groupId)
                .execute();
            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async addAdmins(groupId: string, userIds: string[]) {
        try {
            const inserts = userIds.map(userId => ({
                groupId,
                userId
            }));
            await getDb()
                .insertInto('admin')
                .values(inserts)
                .execute();
            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async deleteAdmins(groupId: string, userIds: string[]) {
        try {
            await getDb()
                .deleteFrom('admin')
                .where('groupId', '=', groupId)
                .where('userId', 'in', userIds)
                .execute();
            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async deleteAllAdmins(groupId: string) {
        try {
            await getDb()
                .deleteFrom('admin')
                .where('groupId', '=', groupId)
                .execute();
            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
}