import { IAdminRepository } from './admin.interfaces';

import { ok, err } from 'shared/result';
import { AdminDTO } from './admin.dto';
import { GroupDTO } from '../group/group.dto';

import { db } from '@db/database';

export default class AdminRepository implements IAdminRepository {
    
    public async getWithGroups(userId: string) {
        try {

            const groups = await db
                .selectFrom('admin')
                .innerJoin('group', 'group.groupId', 'admin.groupId')
                .selectAll('group')
                .where('admin.userId', '=', userId)
                .execute();
            
            return ok(new AdminDTO(
                userId,
                groups.map(group => new GroupDTO(
                    group.groupId,
                    group.groupName,
                    group.canCreate,
                    group.canDelete,
                    group.canRename,
                    group.isActive
                ))
            ));
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
    
    public async editGroupPermissions(groupId: string, permissions: Partial<GroupDTO>) {
        try {
            // Update the group permissions
            await db
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
            await db
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
            await db
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
            await db
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