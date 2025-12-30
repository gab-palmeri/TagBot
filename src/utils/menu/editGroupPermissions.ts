import { GroupDTO } from '@db/group/group.dto';

import { err, ok } from '@utils/result';
import AdminRepository from '@db/admin/admin.repository';

export default async function editGroupPermissions(groupId: string, userId: string, permissions: Partial<GroupDTO>) {

    const adminRepository = new AdminRepository();

    //1) Fetch the admin with their groups
    const adminResult = await adminRepository.getWithGroups(userId);

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
        const groupResult = await adminRepository.editGroupPermissions(groupId, permissions);
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