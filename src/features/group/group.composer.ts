import { Composer } from "grammy";
import { checkIfAdmin, checkIfGroup } from "shared/middlewares";
import GroupServices from "./group.services";

import { startMessage, helpMessage, restartSuccessMessage, restartErrorMessage, botRejoinedMessage, botJoinErrorMessage, botPromotedMessage, migrateSuccessMessage, migrateErrorMessage } from "@messages/generalMessages";
import { ServiceResponseStatus } from "../../shared/enums";

const GroupComposer = new Composer();


/**************************** */
GroupComposer.command("start", checkIfGroup, async ctx => {

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
    //reload the admin list of the group
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const result = await GroupServices.reloadAdminList(groupId, adminList.map(admin => admin.user.id));

    switch(result) {
        case ServiceResponseStatus.OK:
            await ctx.reply(restartSuccessMessage);
            break;
        case ServiceResponseStatus.NOT_FOUND:
            await ctx.reply(restartErrorMessage);
            break;
        case ServiceResponseStatus.ERROR:
            await ctx.reply(restartErrorMessage);
            break;
    }
});

/******************** */

GroupComposer.on("my_chat_member", checkIfGroup, async ctx => {

    const oldStatus = ctx.myChatMember.old_chat_member.status;
    const newStatus = ctx.myChatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();
    const groupName = ctx.chat.title;

    const adminList = (await ctx.api.getChatAdministrators(ctx.chat.id)).map(admin => admin.user.id);

    const response = await GroupServices.handleBotChange(oldStatus, newStatus);
    
    //If the bot is added to the group, try to add it to the DB
    //TODO: better name since it's not actually added yet
    if(response === ServiceResponseStatus.BOT_ADDED) {
        const result = await GroupServices.createGroup(groupName, groupId, adminList);

        if(result === ServiceResponseStatus.OK){
            await ctx.reply(startMessage, { parse_mode: "HTML" });
        }
        else if(result === ServiceResponseStatus.ALREADY_EXISTS){
            console.log("group already exists");
            await GroupServices.createAdminList(groupId, adminList);
            await GroupServices.toggleGroupActive(groupId);
            await ctx.reply(botRejoinedMessage, {parse_mode: "HTML"});
        }
        else {
            await ctx.reply(botJoinErrorMessage);
            await ctx.leaveChat();
        }
    }
    else if(response === ServiceResponseStatus.BOT_PROMOTED) {
        await ctx.reply(botPromotedMessage, {parse_mode: "HTML"});
    }
    else if(response === ServiceResponseStatus.BOT_KICKED) {
        await GroupServices.deleteAdminList(groupId);
        await GroupServices.toggleGroupActive(groupId);
    }
});

GroupComposer.on(":migrate_to_chat_id", async ctx => {

    const oldGroupId = ctx.chat.id.toString();
    const newGroupId = ctx.msg.migrate_to_chat_id.toString();

    const response = await GroupServices.migrateGroup(oldGroupId, newGroupId);

    switch(response) {
        case ServiceResponseStatus.OK:
            await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateSuccessMessage);
            break;
        case ServiceResponseStatus.NOT_FOUND:
            await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
            break;
        case ServiceResponseStatus.ERROR:
            await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
            break;
    }
});


GroupComposer.on("chat_member", async ctx => {

    const oldStatus = ctx.chatMember.old_chat_member.status;
    const newStatus = ctx.chatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();

    const isBot = !ctx.chatMember.new_chat_member.user.is_bot;

    if(!isBot) {
        const response = await GroupServices.handleMemberChange(oldStatus, newStatus);
        if(response === ServiceResponseStatus.ADD_ADMIN) {
            await GroupServices.addAdmin(groupId, ctx.chatMember.new_chat_member.user.id);
        }
        else if(response === ServiceResponseStatus.REMOVE_ADMIN) {
            await GroupServices.removeAdmin(groupId, ctx.chatMember.new_chat_member.user.id);
        }
    }

    //AGGIUNGERE A SUBSCRIBER 
    // if(["member","administrator","creator"].includes(oldStatus) && ["kicked","left"].includes(newStatus) && !ctx.chatMember.new_chat_member.user.is_bot)
    //     await SubscriberServices.setInactive(groupId, ctx.chatMember.old_chat_member.user.id);

    // if(["kicked","left"].includes(oldStatus) && ["member","administrator","creator"].includes(newStatus) && !ctx.chatMember.new_chat_member.user.is_bot)
    //     await SubscriberServices.setActive(groupId, ctx.chatMember.new_chat_member.user.id);

});

export default GroupComposer;