import { MyContext } from "@utils/customTypes";
import GroupServices from "features/group/group.services";
import GroupRepository from "features/group/group.repository";
import AdminServices from "features/admin/admin.services";
import AdminRepository from "features/admin/admin.repository";
import UserServices from "features/user/user.services";
import UserRepository from "features/user/user.repository";

import { startMessage, botRejoinedMessage, botJoinErrorMessage, botPromotedMessage } from "@utils/messages/generalMessages";
import { NextFunction } from "grammy";

const groupService = new GroupServices(new GroupRepository());
const adminService = new AdminServices(new AdminRepository());
const userService = new UserServices(new UserRepository());

export async function myGroupChatMemberHandler(ctx: MyContext, next: NextFunction) {

    if(ctx.hasChatType("private"))
        return await next();

    const oldStatus = ctx.myChatMember.old_chat_member.status;
    const newStatus = ctx.myChatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();
    const groupName = ctx.chat.title;

    const response = await groupService.handleBotChange(oldStatus, newStatus);

    console.log(response);
    
    //If the bot is added to the group, try to add it to the DB
    if(response.ok === true) {
        if(response.value === "BOT_ADDED") {
            const result = await groupService.createGroup(groupName, groupId);

            const adminList = (await ctx.api.getChatAdministrators(ctx.chat.id));
            const adminIDs = adminList.map(admin => admin.user.id.toString());

            if(result.ok === true) {
                await adminService.addAdmins(groupId, adminIDs);
                await ctx.reply(startMessage, { parse_mode: "HTML", link_preview_options: { is_disabled: true } });
            }
            else{
                switch(result.error) {
                    case "ALREADY_EXISTS":
                        console.log("group already exists");
                        await adminService.addAdmins(groupId, adminIDs);
                        await groupService.setGroupActive(groupId, true);
                        await ctx.reply(botRejoinedMessage, {parse_mode: "HTML"});
                        break;
                    case "INTERNAL_ERROR":
                        await ctx.reply(botJoinErrorMessage);
                        await ctx.leaveChat();
                        break;
                }
            }
        }
        else if(response.value === "BOT_PROMOTED") {
            await ctx.reply(botPromotedMessage, {parse_mode: "HTML"});
        }
        else if(response.value === "BOT_KICKED") {
            await adminService.deleteAllAdmins(groupId);
            await groupService.setGroupActive(groupId, false);
        }
    }
}

export async function myPrivateChatMemberHandler(ctx: MyContext, next: NextFunction) {

    if(ctx.hasChatType("group"))
        return await next();
    const newStatus = ctx.myChatMember.new_chat_member.status;
    const userId = ctx.chat.id.toString();

    if(newStatus !== "member") {
        await userService.setBotStarted(userId, false);
    }
    else {
        const userExists = await userService.userExists(userId);

        //TODO: put a last updated_field
        if(userExists.ok === true && userExists.value === true) {
            await userService.setBotStarted(userId, true);
        }
        else {
            await userService.saveUser(userId.toString(), ctx.chat.username || "");
        } 
    }
}