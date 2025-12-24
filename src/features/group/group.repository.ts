import { IGroupRepository } from "./group.interfaces";
import { err, ok } from "shared/result";
import { GroupDTO } from "./group.dto";

import { db } from "@db/database";

export default class GroupRepository implements IGroupRepository {
    public async createGroup(groupId: string, groupName: string, adminsIDs: string[]) {
        try {
            await db.insertInto('group')
                .values({
                    groupId: groupId,
                    groupName: groupName,
                })
                .execute();

            if (adminsIDs.length > 0) {
                await db.insertInto('admin')
                    .values(adminsIDs.map(adminID => ({
                        groupId: groupId,
                        userId: adminID,
                    })))
                    .execute();
            }

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
            await db.updateTable('group')
                .set({ groupId: newGroupId })
                .where('groupId', '=', oldGroupId)
                .execute();

            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }

    }

    public async toggleGroupActive(groupId: string) {
        try {
            await db
                .updateTable('group')
                .set((eb) => ({
                    isActive: eb.not('isActive'),
                }))
                .where('groupId', '=', groupId)
                .execute();
                
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }

    
    public async createAdminList(groupId: string, adminsIDs: string[]) {
        try {
            await db.insertInto('admin')
                .values(adminsIDs.map(adminID => ({
                    groupId: groupId,
                    userId: adminID
                })))
                .execute();

            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }

    public async deleteAdminList(groupId: string) {
        try {
            await db.deleteFrom('admin').where('groupId', '=', groupId).execute();

            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }

    //TODO: rimuovere questo metodo e usare createAdminList e deleteAdminList direttamente
    public async reloadAdminList(groupId: string, adminsIDs: string[]) {
        try {
            
            await this.deleteAdminList(groupId);
            await this.createAdminList(groupId, adminsIDs);
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }
    
    public async addAdmin(groupId: string, adminID: string) {
        try {
            await db.insertInto('admin')
                .values({
                    groupId: groupId,
                    userId: adminID,
                })
                .execute();
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }
    
    public async removeAdmin(groupId: string, adminID: string) {
        try {
            await db.deleteFrom('admin')
                .where('groupId', '=', groupId)
                .where('userId', '=', adminID)
                .execute();
                
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }
}

