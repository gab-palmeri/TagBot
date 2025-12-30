import { IGroupRepository } from "./group.interfaces";
import { err, ok } from "@utils/result";
import { GroupDTO } from "./group.dto";

import { db } from "@db/database";

export default class GroupRepository implements IGroupRepository {
    public async createGroup(groupId: string, groupName: string) {
        try {
            await db.insertInto('group')
                .values({
                    groupId: groupId,
                    groupName: groupName,
                })
                .execute();

            return ok(null);
        }
        catch(e) {
            console.log(e.code);
            if(e.code === "23505") {
                return err("ALREADY_EXISTS");
            }
            else {
                return err("DB_ERROR");
            }
        }
    }

    public async getGroup(groupID: string) {
        try {
            const group = await db.selectFrom('group')
                .selectAll()
                .where('groupId', '=', groupID)
                .executeTakeFirst();

            if (!group) {
                return err("NOT_FOUND");
            }

            const groupDTO: GroupDTO = {
                groupId: group.groupId,
                groupName: group.groupName,
                canCreate: group.canCreate,
                canDelete: group.canDelete,
                canRename: group.canRename,
                isActive: group.isActive,
            };
            return ok(groupDTO);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }
    
    public async migrateGroup(oldGroupId: string, newGroupId: string) {
        try {
    
            const result = await db.updateTable('group')
                .set({ groupId: newGroupId })
                .where('groupId', '=', oldGroupId)
                .executeTakeFirst();

            if (result?.numUpdatedRows && result.numUpdatedRows > 0) {
                return err("NOT_FOUND");
            }

            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }

    }

    public async setGroupActive(groupId: string, isActive: boolean) {
        try {
            await db
                .updateTable('group')
                .set(() => ({
                    isActive: isActive,
                }))
                .where('groupId', '=', groupId)
                .execute();
                
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }
}

