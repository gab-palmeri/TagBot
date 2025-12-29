import { GroupDTO } from 'features/group/group.dto';
import { IAdminRepository, IAdminServices } from './admin.interfaces';

import { err, ok } from 'shared/result';

export default class AdminServices implements IAdminServices {

    constructor(readonly adminRepository: IAdminRepository) {}
    
    public async getAdminGroups(userId: string) {		
        
        const response = await this.adminRepository.getWithGroups(userId);

        if(response.ok === true) {
            const groups = response.value.groups;
            if(groups.length == 0) {
                return err("NO_CONTENT");
            }
            else {
                return ok(groups);
            }
        }
        else {
            return err("INTERNAL_ERROR");
        }
    }
    
    public async editGroupPermissions(groupId: string, userId: string, permissions: Partial<GroupDTO>) {

        //1) Fetch the admin with their groups
        const adminResult = await this.adminRepository.getWithGroups(userId);

        if(adminResult.ok === false) {
            if(adminResult.error === "DB_ERROR") {
                return err("INTERNAL_ERROR");
            }
        }
        else {
            //Look for the current group in the admin's groups
            const admin = adminResult.value;
            const group = admin.groups.find(g => g.groupId === groupId);
            if(!group) {
                return err("FORBIDDEN");
            }

            //If found, proceed to edit permissions
            const groupResult = await this.adminRepository.editGroupPermissions(groupId, permissions);
            if(groupResult.ok === false) {
                if(groupResult.error === "DB_ERROR") {
                    return err("INTERNAL_ERROR");
                }
            }
            else {
                return ok(null);
            }
        }
    }

    public async addAdmins(groupId: string, userIds: string[]) {
        const response = await this.adminRepository.addAdmins(groupId, userIds);
        if(response.ok === false) {
            return err("INTERNAL_ERROR");
        }
        return ok(null);
    }

    public async removeAdmins(groupId: string, userIds: string[]) {
        const response = await this.adminRepository.deleteAdmins(groupId, userIds);
        if(response.ok === false) {
            return err("INTERNAL_ERROR");
        }
        return ok(null);
    }

    public async reloadAdmins(groupId: string, userIds: string[]) {
        const deleteResponse = await this.adminRepository.deleteAllAdmins(groupId);
        if(deleteResponse.ok === false) {
            return err("INTERNAL_ERROR");
        }

        const addResponse = await this.adminRepository.addAdmins(groupId, userIds);
        if(addResponse.ok === false) {
            return err("INTERNAL_ERROR");
        }

        return ok(null);
    }

    public async deleteAllAdmins(groupId: string) {
        const response = await this.adminRepository.deleteAllAdmins(groupId);
        if(response.ok === false) {
            return err("INTERNAL_ERROR");
        }
        return ok(null);

    }
}

