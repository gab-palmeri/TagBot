import { Composer } from "grammy";
import { checkIfAdmin, checkIfGroup } from "../middlewares";
import GeneralServices from "../services/GeneralServices";
import SubscriberServices from "../services/SubscriberServices";
import UserServices from "../services/UserServices";

import { startMessage, helpMessage, restartSuccessMessage, restartErrorMessage, botRejoinedMessage, botJoinErrorMessage, botPromotedMessage, migrateSuccessMessage, migrateErrorMessage } from "../messages/generalMessages";
import { msgJoinPrivate } from "../messages/subscriberMessages";

const GeneralComposer = new Composer();

GeneralComposer.command("start", async ctx => {

    await ctx.reply(
        startMessage,
        { parse_mode: "HTML", disable_web_page_preview: true }
    );

    if(ctx.chat.type === "private") {
        await UserServices.saveUser(ctx.chat.id.toString());

        const joinArgs = ctx.match.split("_");

        if(ctx.match.length > 0 && joinArgs.length === 3) {
            
            const userId = joinArgs[0];
            const groupId = joinArgs[1];
            const tagName = joinArgs[2];

            const response = await SubscriberServices.joinTag(parseInt(groupId), tagName, userId);

            if(response.state === "ok") {
                await ctx.reply(msgJoinPrivate(tagName), { parse_mode: "HTML" });
            }
            else {
                const message = "⚠️ " + response.message;
                await ctx.reply(message);
            }
        }
    }

    
});

GeneralComposer.command("help", async ctx => {
    await ctx.reply(helpMessage, { parse_mode: "HTML" });
});

GeneralComposer.command("restart", checkIfGroup, checkIfAdmin, async ctx => {
    //reload the admin list of the group
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const response = await GeneralServices.loadAdminList(ctx.chat.id, adminList.map(admin => admin.user.id));

    if(response.state === "ok") {
        await ctx.reply(restartSuccessMessage);
    }
    else {
        console.log(response);
        await ctx.reply(restartErrorMessage);
    }
});

GeneralComposer.on(["message:new_chat_members:me", "message:group_chat_created", "message:supergroup_chat_created"], async ctx => {
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const response = await GeneralServices.createGroup(ctx.chat.id, adminList.map(admin => admin.user.id));

    if(response.state === "ok") {
        await ctx.reply(startMessage, { parse_mode: "HTML" });
    }
    else if(response.state === "ALREADY_EXISTS"){
        //check if the bot is admin
        await ctx.reply(botRejoinedMessage, {parse_mode: "HTML"});
    }
    else {
        await ctx.reply(botJoinErrorMessage);
        await ctx.leaveChat();
    }
});

GeneralComposer.on("my_chat_member", async ctx => {
    if(ctx.myChatMember.chat.type !== "private" && ctx.myChatMember.old_chat_member.status === "member" && ctx.myChatMember.new_chat_member.status === "administrator") {
        await ctx.reply(botPromotedMessage);
    }
    else if(ctx.myChatMember.chat.type === "private" && ctx.myChatMember.new_chat_member.status !== "member") {
        await UserServices.deleteUser(ctx.myChatMember.chat.id.toString());
    }
});

GeneralComposer.on(":migrate_to_chat_id", async ctx => {
    const response = await GeneralServices.migrateGroup(ctx.chat.id, ctx.msg.migrate_to_chat_id);
    if(response.state === "ok")
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateSuccessMessage);
    else 
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
});


GeneralComposer.on("chat_member", async ctx => {
    ctx.chatMember.old_chat_member.status === "member" && ctx.chatMember.new_chat_member.status === "administrator"
    && !ctx.chatMember.new_chat_member.user.is_bot && GeneralServices.addAdmin(ctx.chat.id, ctx.chatMember.new_chat_member.user.id);
    
    ctx.chatMember.old_chat_member.status === "administrator"
    && (ctx.chatMember.new_chat_member.status === "member" || ctx.chatMember.new_chat_member.status === "left")
    && !ctx.chatMember.new_chat_member.user.is_bot
    && GeneralServices.removeAdmin(ctx.chat.id, ctx.chatMember.old_chat_member.user.id);
});

export default GeneralComposer;