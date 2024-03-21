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

        if(ctx.match.length > 0 && joinArgs.length === 2) {
            
            const userId = ctx.chat.id.toString();
            const groupId = joinArgs[0];
            const tagName = joinArgs[1];

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
    const response = await GeneralServices.reloadAdminList(ctx.chat.id, adminList.map(admin => admin.user.id));

    if(response.state === "ok") {
        await ctx.reply(restartSuccessMessage);
    }
    else {
        console.log(response);
        await ctx.reply(restartErrorMessage);
    }
});

GeneralComposer.on("my_chat_member", async ctx => {

    const chatType = ctx.chat.type;
    const oldStatus = ctx.myChatMember.old_chat_member.status;
    const newStatus = ctx.myChatMember.new_chat_member.status;


    if(chatType !== "private") {

        //Bot added to the group or supergroup
        if((oldStatus === "left" || oldStatus == "kicked") && (newStatus === "member" || newStatus === "administrator")) {
            const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
            const response = await GeneralServices.createGroup(ctx.chat.title, ctx.chat.id, adminList.map(admin => admin.user.id));


            if(response.state === "ok") {
                await ctx.reply(startMessage, { parse_mode: "HTML" });
            }
            else if(response.state === "ALREADY_EXISTS"){
                await GeneralServices.toggleGroupActive(ctx.chat.id);
                await ctx.reply(botRejoinedMessage, {parse_mode: "HTML"});
            }
            else {
                await ctx.reply(botJoinErrorMessage);
                await ctx.leaveChat();
            }
        }

        //Bot promoted to admin or kicked
        if(oldStatus === "member" && newStatus === "administrator")
            await ctx.reply(botPromotedMessage);
        else if(newStatus === "kicked" || newStatus === "left") {
            await GeneralServices.deleteAdminList(ctx.myChatMember.chat.id);
            await GeneralServices.toggleGroupActive(ctx.myChatMember.chat.id);
        }
            
    }
    else if(chatType === "private" && newStatus !== "member") {
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

    const oldStatus = ctx.chatMember.old_chat_member.status;
    const newStatus = ctx.chatMember.new_chat_member.status;

    //Add admin
    if(oldStatus === "member" && newStatus === "administrator" && !ctx.chatMember.new_chat_member.user.is_bot)
        await GeneralServices.addAdmin(ctx.chat.id, ctx.chatMember.new_chat_member.user.id);
    
    //Remove admin
    if(oldStatus === "administrator" && ["member","left","kicked"].includes(newStatus) && !ctx.chatMember.new_chat_member.user.is_bot)
        await GeneralServices.removeAdmin(ctx.chat.id, ctx.chatMember.old_chat_member.user.id);


    if(["member","administrator","creator"].includes(oldStatus) && ["kicked","left"].includes(newStatus) && !ctx.chatMember.new_chat_member.user.is_bot)
        await SubscriberServices.setInactive(ctx.chatMember.chat.id, ctx.chatMember.old_chat_member.user.id);

    if(["kicked","left"].includes(oldStatus) && ["member","administrator","creator"].includes(newStatus) && !ctx.chatMember.new_chat_member.user.is_bot)
        await SubscriberServices.setActive(ctx.chatMember.chat.id, ctx.chatMember.new_chat_member.user.id);

});

export default GeneralComposer;