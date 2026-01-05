import { GroupDTO } from '@db/group/group.dto';

import AdminRepository from '@db/admin/admin.repository';

export default async function editGroupPermissions(groupId: string, userId: string, permissions: Partial<GroupDTO>) {

    const adminRepository = new AdminRepository();

    //1) Fetch the admin with their groups
    const adminResult = await adminRepository.getWithGroups(userId);


    //Look for the current group in the admin's groups
    const group = adminResult.groups.find(g => g.groupId === groupId);
    if(!group) {
        return false;
    }

        //If found, proceed to edit permissions
    await adminRepository.editGroupPermissions(group.id, permissions);
    return true;
}