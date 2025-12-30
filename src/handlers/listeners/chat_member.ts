import { MyContext } from "@utils/customTypes";
import { NextFunction } from "grammy";

import SubscriberRepository from "db/subscriber/subscriber.repository";
import AdminRepository from "@db/admin/admin.repository";


const subscriberRepository = new SubscriberRepository();
const adminRepository = new AdminRepository();


export async function chatMemberHandler(ctx: MyContext, next: NextFunction) {

    // Take parameters
    const ACTIVE_STATUSES = new Set(["member", "administrator", "creator"]);
    const INACTIVE_STATUSES = new Set(["left", "kicked"]);

    const { old_chat_member, new_chat_member } = ctx.chatMember;

    const oldStatus = old_chat_member.status;
    const newStatus = new_chat_member.status;
    const userId = new_chat_member.user.id.toString();
    const groupId = ctx.chatId.toString();

     if (new_chat_member.user.is_bot) return next();
    

    //Handle subscriber active flag and admin add/removal
    if (ACTIVE_STATUSES.has(oldStatus) && INACTIVE_STATUSES.has(newStatus)) {
        await subscriberRepository.setActiveFlag(groupId, userId, false);
    }

    if (INACTIVE_STATUSES.has(oldStatus) && ACTIVE_STATUSES.has(newStatus)) {
        await subscriberRepository.setActiveFlag(groupId, userId, true);
    }

    else {
        
        const wasAdmin = oldStatus === "administrator";
        const isAdmin = newStatus === "administrator";

        if (!wasAdmin && isAdmin) {
            await adminRepository.addAdmins(groupId, [userId]);
        }

        if (wasAdmin && !isAdmin) {
            await adminRepository.deleteAdmins(groupId, [userId]);
        }
    }
}