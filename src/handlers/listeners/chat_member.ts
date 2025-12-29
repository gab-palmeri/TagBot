import { MyContext } from "@utils/customTypes";
import { NextFunction } from "grammy";

import SubscriberServices from "features/subscriber/subscriber.services";
import SubscriberRepository from "features/subscriber/subscriber.repository";
import GroupServices from "features/group/group.services";
import GroupRepository from "features/group/group.repository";
import AdminServices from "features/admin/admin.services";
import AdminRepository from "features/admin/admin.repository";


const groupService = new GroupServices(new GroupRepository());
const subscriberService = new SubscriberServices(new SubscriberRepository());
const adminService = new AdminServices(new AdminRepository());


export async function chatMemberHandler(ctx: MyContext, next: NextFunction) {

    const oldStatus = ctx.chatMember.old_chat_member.status;
    const newStatus = ctx.chatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();

    const isBot = ctx.chatMember.new_chat_member.user.is_bot;

    //Handle subscriber active flag and admin add/removal
    if(!isBot) {
        if(["member","administrator","creator"].includes(oldStatus) && ["kicked","left"].includes(newStatus))
            await subscriberService.setActiveFlag(groupId, ctx.chatMember.old_chat_member.user.id, false);

        else if(["kicked","left"].includes(oldStatus) && ["member","administrator","creator"].includes(newStatus))
            await subscriberService.setActiveFlag(groupId, ctx.chatMember.new_chat_member.user.id, true);

        else {
            const response = await groupService.handleMemberChange(oldStatus, newStatus);

            if(response.ok === true) {
                if(response.value === "ADD_ADMIN") {
                    await adminService.addAdmins(groupId, [ctx.chatMember.new_chat_member.user.id.toString()]);
                }
                else if(response.value === "REMOVE_ADMIN") {
                    await adminService.removeAdmins(groupId, [ctx.chatMember.new_chat_member.user.id.toString()]);
                }
            }
        }
    }
    return next();
}