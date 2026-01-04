import { MyContext } from "@utils/customTypes";
import { NextFunction } from "grammy";

import SubscriberRepository from "db/subscriber/subscriber.repository";
import AdminRepository from "@db/admin/admin.repository";
import GroupRepository from "@db/group/group.repository";


export async function chatMemberHandler(ctx: MyContext, next: NextFunction) {

    const subscriberRepository = new SubscriberRepository();
    const adminRepository = new AdminRepository();
    const groupRepository = new GroupRepository();


    // Take parameters
    const ACTIVE_STATUSES = new Set(["member", "administrator", "creator"]);
    const INACTIVE_STATUSES = new Set(["left", "kicked"]);

    const { old_chat_member, new_chat_member } = ctx.chatMember;

    const oldStatus = old_chat_member.status;
    const newStatus = new_chat_member.status;
    const userId = new_chat_member.user.id.toString();
    const groupId = ctx.chatId.toString();

    if (new_chat_member.user.is_bot) return next();

    // Get group
    const group = await groupRepository.getGroup(groupId);
    

    //Handle subscriber active flag and admin add/removal
    if (ACTIVE_STATUSES.has(oldStatus) && INACTIVE_STATUSES.has(newStatus)) {
        await subscriberRepository.setActiveFlag(group.id, userId, false);
    }

    if (INACTIVE_STATUSES.has(oldStatus) && ACTIVE_STATUSES.has(newStatus)) {
        await subscriberRepository.setActiveFlag(group.id, userId, true);
    }

    else {
        
        const wasAdmin = oldStatus === "administrator";
        const isAdmin = newStatus === "administrator";

        if (!wasAdmin && isAdmin) {
            await adminRepository.addAdmins(group.id, [userId]);
        }

        if (wasAdmin && !isAdmin) {
            await adminRepository.deleteAdmins(group.id, [userId]);
        }
    }
}