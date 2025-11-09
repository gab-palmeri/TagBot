import { Group } from "@db/entity/Group";
import { Admin } from "@db/entity/Admin";
import { IGroupRepository } from "./group.interfaces";
import { err, ok, Result } from "shared/result";
import { GroupDTO } from "./group.dto";

export default class GroupRepository implements IGroupRepository {
    public async createGroup(groupId: string, groupName: string, adminsIDs: string[]) {
        try {
            let group = new Group();
            group.groupName = groupName;
            group.groupId = groupId;
    
            group.admins = adminsIDs.map((adminID) => {
                const admin = new Admin();
                admin.userId = adminID;
                return admin;
            });
    
            group = await group.save();
            return ok(null);
        }
        catch(e) {
            if(e.code === "ER_DUP_ENTRY") {
                return err("ALREADY_EXISTS");
            }
            else {
                return err("DB_ERROR");
            }
        }
    }

    public async getGroup(groupID: string) {
        try {
            const group = await Group.findOne({ where: { groupId: groupID }, relations: ["admins"] });
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
            const group = await Group.findOne({where: {groupId: oldGroupId}});
            if (!group) {
                return err("NOT_FOUND");
            }
            group.groupId = newGroupId;
            await group.save();
            return ok(null);
        }
        catch(e) {
            console.log(err);
            return err("DB_ERROR");
        }

    }

    public async toggleGroupActive(groupId: string) {
        try {
            const group = await Group.findOne({where: {groupId: groupId}});
            if (!group) {
                return err("NOT_FOUND");
            }
            group.isActive = !group.isActive;
            await group.save();
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }

    
    public async createAdminList(groupId: string, adminsIDs: string[]) {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
    
            group.admins = group.admins.concat(
                adminsIDs.map((adminID) => {
                    const admin = new Admin();
                    admin.userId = adminID;
                    return admin;
                })
            );
    
            await group.save();
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }

    public async deleteAdminList(groupId: string) {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
            
            await Admin.remove(group.admins);

            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }

    public async reloadAdminList(groupId: string, adminsIDs: string[]) {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
    
            //add all the new admins
            const newAdminsIDs = adminsIDs.filter((adminID) => {
                return !group.admins.find((admin) => admin.userId == adminID);
            });
    
            group.admins = group.admins.concat(
                newAdminsIDs.map((adminID) => {
                    const admin = new Admin();
                    admin.userId = adminID;
                    return admin;
                })
            );
    
            await group.save();
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }
    
    public async addAdmin(groupId: string, adminID: string) {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
    
            const admin = new Admin();
            admin.userId = adminID;
            group.admins.push(admin);
            await group.save();
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }
    
    public async removeAdmin(groupId: string, adminID: string) {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
    
            const toDeleteAdmin = group.admins.find((admin) => admin.userId == adminID);
            if (toDeleteAdmin !== null) {
                await toDeleteAdmin.remove();
            }
            return ok(null);
        }
        catch(e) {
            return err("DB_ERROR");
        }
    }
}

