import { Composer } from "grammy";
import { checkIfAdmin, checkIfGroup } from "shared/middlewares";
import GroupServices from "./group.services";

import { startMessage, helpMessage, restartSuccessMessage, restartErrorMessage, botRejoinedMessage, botJoinErrorMessage, botPromotedMessage, migrateSuccessMessage, migrateErrorMessage } from "@messages/generalMessages";
import GroupRepository from "./group.repository";

const GroupComposer = new Composer();
const groupService = new GroupServices(new GroupRepository());


/**************************** */
GroupComposer.command("start", async ctx => {
    await ctx.reply(
        startMessage,
        { 
            parse_mode: "HTML",
            link_preview_options: { is_disabled: true }
        }
    );    
});

GroupComposer.command("help", async ctx => {
    await ctx.reply(helpMessage, { parse_mode: "HTML" });
});



GroupComposer.command("restart", checkIfGroup, checkIfAdmin, async ctx => {

    const groupId = ctx.chat.id.toString();
    
    //Get the admins list from Telegram API and convert them to strings
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const adminIDs = adminList.map(admin => admin.user.id.toString());
    const result = await groupService.reloadAdminList(groupId, adminIDs);

    if(result.ok === true) {
        return await ctx.reply(restartSuccessMessage);
    }
    else {
        switch(result.error) {
            case "INTERNAL_ERROR":
                return await ctx.reply(restartErrorMessage);
        }
    }
});

/******************** */

GroupComposer.on("my_chat_member", checkIfGroup, async ctx => {

    const oldStatus = ctx.myChatMember.old_chat_member.status;
    const newStatus = ctx.myChatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();
    const groupName = ctx.chat.title;

    const adminList = (await ctx.api.getChatAdministrators(ctx.chat.id));
    const adminIDs = adminList.map(admin => admin.user.id.toString());

    const response = await groupService.handleBotChange(oldStatus, newStatus);
    
    //If the bot is added to the group, try to add it to the DB
    //TODO: better name since it's not actually added yet
    if(response.ok === true) {
        if(response.value === "BOT_ADDED") {
            const result = await groupService.createGroup(groupName, groupId, adminIDs);

            if(result.ok === true) {
                await ctx.reply(startMessage, { parse_mode: "HTML" });
            }
            else{
                switch(result.error) {
                    case "ALREADY_EXISTS":
                        console.log("group already exists");
                        await groupService.createAdminList(groupId, adminIDs);
                        await groupService.toggleGroupActive(groupId);
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
            await groupService.deleteAdminList(groupId);
            await groupService.toggleGroupActive(groupId);
        }
    }
});

GroupComposer.on(":migrate_to_chat_id", async ctx => {

    const oldGroupId = ctx.chat.id.toString();
    const newGroupId = ctx.msg.migrate_to_chat_id.toString();

    const response = await groupService.migrateGroup(oldGroupId, newGroupId);

    if(response.ok === true) {
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateSuccessMessage);
        return;
    }
    else {
        switch(response.error) {
            case "NOT_FOUND":
                return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
            case "INTERNAL_ERROR":
                return await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
        }
    }   
});


GroupComposer.on("chat_member", async ctx => {

    const oldStatus = ctx.chatMember.old_chat_member.status;
    const newStatus = ctx.chatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();

    const isBot = !ctx.chatMember.new_chat_member.user.is_bot;

    if(!isBot) {
        const response = await groupService.handleMemberChange(oldStatus, newStatus);

        if(response.ok === true) {
            if(response.value === "ADD_ADMIN") {
                await groupService.addAdmin(groupId, ctx.chatMember.new_chat_member.user.id.toString());
            }
            else if(response.value === "REMOVE_ADMIN") {
                await groupService.removeAdmin(groupId, ctx.chatMember.new_chat_member.user.id.toString());
            }
        }
    }
});

export default GroupComposer;