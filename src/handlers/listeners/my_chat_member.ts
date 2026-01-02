import { MyContext } from "@utils/customTypes";
import GroupRepository from "@db/group/group.repository";
import AdminRepository from "@db/admin/admin.repository";
import UserRepository from "@db/user/user.repository";

import { startMessage, botRejoinedMessage, botJoinErrorMessage, botPromotedMessage } from "@utils/messages/generalMessages";
import { NextFunction } from "grammy";

const groupRepository = new GroupRepository();
const adminRepository = new AdminRepository();
const userRepository = new UserRepository();

export async function myGroupChatMemberHandler(ctx: MyContext, next: NextFunction) {
    if (ctx.hasChatType("private")) return next();

    const { old_chat_member, new_chat_member } = ctx.myChatMember;
    const oldStatus = old_chat_member.status;
    const newStatus = new_chat_member.status;

    const groupId = ctx.chatId.toString();
    const groupName = ctx.chat.title;

    const wasOut = oldStatus === "left" || oldStatus === "kicked";
    const isIn = newStatus === "member" || newStatus === "administrator";

    // BOT ADDED
    if (wasOut && isIn) {

        const admins = (await ctx.api.getChatAdministrators(ctx.chat.id))
                    .map(a => a.user.id.toString());
                    

        try {
            const group = await groupRepository.getGroup(groupId);

            if (group !== null) {
                await adminRepository.addAdmins(groupId, admins);
                await groupRepository.setGroupActive(groupId, true);
                await ctx.reply(botRejoinedMessage, { parse_mode: "HTML" });
            }
            else {
                await groupRepository.createGroup(groupId, groupName);
                await adminRepository.addAdmins(groupId, admins);
                return await ctx.reply(startMessage, { parse_mode: "HTML", link_preview_options: { is_disabled: true } });
                
            }
        }
        catch(e) {
            await ctx.reply(botJoinErrorMessage);
            await ctx.leaveChat();
            throw e;
        }
    }

    // BOT PROMOTED
    if (oldStatus === "member" && newStatus === "administrator") {
        await ctx.reply(botPromotedMessage, { parse_mode: "HTML" });
        return;
    }

    // BOT KICKED / LEFT
    if (newStatus === "left" || newStatus === "kicked") {
        await adminRepository.deleteAllAdmins(groupId);
        await groupRepository.setGroupActive(groupId, false);
        return;
    }
}


export async function myPrivateChatMemberHandler(ctx: MyContext, next: NextFunction) {

    if(ctx.hasChatType("group"))
        return await next();

    // Take parameters
    const newStatus = ctx.myChatMember.new_chat_member.status;
    const userId = ctx.chatId.toString();

    // Handle user bot_started flag
    if(newStatus !== "member") {
        await userRepository.setBotStarted(userId, false);
    }
    else {
        const user = userRepository.getUser(userId);

        if(user !== null) {
            await userRepository.setBotStarted(userId, true);
        }
        else {
            await userRepository.saveUser(userId.toString(), ctx.chat.username || "");
        }
    }
}