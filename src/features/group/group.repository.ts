import { Group } from "@db/entity/Group";
import { Admin } from "@db/entity/Admin";
import { AdminDTO } from "../admin/admin.dto";
import { RepoResponseStatus } from "../../shared/enums";

export default class GroupRepository {
    static async createGroup(groupId: string, groupName: string, adminsDTOS: AdminDTO[]): Promise<RepoResponseStatus> {
        try {
            let group = new Group();
            group.groupName = groupName;
            group.groupId = groupId;
    
            group.admins = adminsDTOS.map((adminDTO) => {
                const admin = new Admin();
                admin.userId = adminDTO.userId;
                return admin;
            });
    
            group = await group.save();
            return RepoResponseStatus.SUCCESS;
        }
        catch (error) {
            if(error.code === "ER_DUP_ENTRY") {
                return RepoResponseStatus.ALREADY_EXISTS;
            }
            else {
                return RepoResponseStatus.ERROR;
            }
        }
    }
    
    static async migrateGroup(oldGroupId: string, newGroupId: string): Promise<RepoResponseStatus> {
        try {
            const group = await Group.findOne({where: {groupId: oldGroupId}});
            if (!group) {
                return RepoResponseStatus.NOT_FOUND;
            }
            group.groupId = newGroupId;
            await group.save();
            return RepoResponseStatus.SUCCESS;
        }
        catch (err) {
            console.log(err);
            return RepoResponseStatus.ERROR;
        }
    }

    static async toggleGroupActive(groupId: string): Promise<RepoResponseStatus> {
        try {
            const group = await Group.findOne({where: {groupId: groupId}});
            if (!group) {
                return RepoResponseStatus.NOT_FOUND;
            }
            group.isActive = !group.isActive;
            await group.save();
            return RepoResponseStatus.SUCCESS;
        }
        catch (err) {
            return RepoResponseStatus.ERROR;
        }
    }

    
    static async createAdminList(groupId: string, adminsDTOS: AdminDTO[]): Promise<RepoResponseStatus> {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
            if (!group) {
                return RepoResponseStatus.NOT_FOUND;
            }
    
            group.admins = group.admins.concat(
                adminsDTOS.map((adminDTO) => {
                    const admin = new Admin();
                    admin.userId = adminDTO.userId;
                    return admin;
                })
            );
    
            await group.save();
            return RepoResponseStatus.SUCCESS;
        }
        catch (err) {
            return RepoResponseStatus.ERROR;
        }
    }

    static async deleteAdminList(groupId: string): Promise<RepoResponseStatus> {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
            if (!group) {
                return RepoResponseStatus.NOT_FOUND;
            }
            
            await Admin.remove(group.admins);

            return RepoResponseStatus.SUCCESS;
        }
        catch (err) {
            return RepoResponseStatus.ERROR;
        }
    }

    static async reloadAdminList(groupId: string, adminsDTOS: AdminDTO[]): Promise<RepoResponseStatus> {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
            if (!group) {
                return RepoResponseStatus.NOT_FOUND;
            }
    
            //add all the new admins
            const newAdminsDTOS = adminsDTOS.filter((adminDTO) => {
                return !group.admins.find((admin) => admin.userId == adminDTO.userId);
            });
    
            group.admins = group.admins.concat(
                newAdminsDTOS.map((adminDTO) => {
                    const admin = new Admin();
                    admin.userId = adminDTO.userId;
                    return admin;
                })
            );
    
            await group.save();
            return RepoResponseStatus.SUCCESS;
        }
        catch (err) {
            return RepoResponseStatus.ERROR;
        }
    }
    
    static async addAdmin(groupId: string, adminDTO: AdminDTO): Promise<RepoResponseStatus> {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
            if (!group) {
                return RepoResponseStatus.NOT_FOUND;
            }
    
            const admin = new Admin();
            admin.userId = adminDTO.userId;
            group.admins.push(admin);
            await group.save();
            return RepoResponseStatus.SUCCESS;
        }
        catch (err) {
            return RepoResponseStatus.ERROR;
        }
    }
    
    static async removeAdmin(groupId: string, adminDTO: AdminDTO): Promise<RepoResponseStatus> {
        try {
            const group = await Group.findOne({ where: { groupId: groupId }, relations: ["admins"] });
            if (!group) {
                return RepoResponseStatus.NOT_FOUND;
            }
    
            const toDeleteAdmin = group.admins.find((admin) => admin.userId == adminDTO.userId);
            if (toDeleteAdmin !== null) {
                await toDeleteAdmin.remove();
            }
            return RepoResponseStatus.SUCCESS;
        }
        catch (err) {
            return RepoResponseStatus.ERROR;
        }
    }
}

