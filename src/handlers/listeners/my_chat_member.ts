import { MyContext } from "utils/customTypes";
import GroupRepository from "db/group/group.repository";
import AdminRepository from "db/admin/admin.repository";
import UserRepository from "db/user/user.repository";

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

    // Get group
    const group = await groupRepository.getGroup(groupId);

    // BOT ADDED
    if (wasOut && isIn) {

        const admins = (await ctx.api.getChatAdministrators(ctx.chat.id))
                    .map(a => a.user.id.toString());
                    

        try {

            if (group !== null) {
                await adminRepository.addAdmins(group.id, admins);
                await groupRepository.update(groupId, {isActive: true});
                await ctx.reply(ctx.t("bot-rejoined"), { parse_mode: "HTML" });
            }
            else {
                await groupRepository.createGroup(groupId, groupName);
                const newGroup = await groupRepository.getGroup(groupId);
                await adminRepository.addAdmins(newGroup.id, admins);
                return await ctx.reply(ctx.t("start"), { parse_mode: "HTML", link_preview_options: { is_disabled: true } });
                
            }
        }
        catch(e) {
            await ctx.reply(ctx.t("bot-join-error"));
            await ctx.leaveChat();
            throw e;
        }
    }

    // BOT PROMOTED
    if (oldStatus === "member" && newStatus === "administrator") {
        await ctx.reply(ctx.t("bot-promoted"), { parse_mode: "HTML" });
        return;
    }

    // BOT KICKED / LEFT
    if (newStatus === "left" || newStatus === "kicked") {
        await adminRepository.deleteAllAdmins(group.id);
        await groupRepository.update(groupId, {isActive: false});
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
        await userRepository.update(userId, {hasBotStarted: false});
    }
    else {
        const user = await userRepository.getUser(userId);

        if(user !== null) {
            await userRepository.update(userId, {hasBotStarted: true});
        }
        else {
            await userRepository.saveUser(userId.toString(), ctx.chat.username || "");
        }
    }
}