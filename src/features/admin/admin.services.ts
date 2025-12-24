import { IAdminRepository, IAdminServices } from './admin.interfaces';

import { err, ok } from 'shared/result';

export default class AdminServices implements IAdminServices {

    constructor(readonly adminRepository: IAdminRepository) {}
    
    public async getAdminGroups(userId: string) {		
        
        const response = await this.adminRepository.getAdminWithGroups(userId);

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
    
    public async editGroupPermissions(groupId: string, userId: string, permissions: object) {

        //1) Fetch the admin with their groups
        const adminResult = await this.adminRepository.getAdminWithGroups(userId);

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
            const groupResult = await this.adminRepository.editGroupPermissions(groupId, userId, permissions);
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
}

