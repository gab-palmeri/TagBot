import { Composer } from "grammy";
import { checkIfAdmin, checkIfGroup } from "@utils/middlewares";
import GroupServices from "@service/GroupServices";
import SubscriberServices from "@service/SubscriberServices";
import UserServices from "@service/UserServices";

import { startMessage, helpMessage, restartSuccessMessage, restartErrorMessage, botRejoinedMessage, botJoinErrorMessage, botPromotedMessage, migrateSuccessMessage, migrateErrorMessage } from "@messages/generalMessages";
import { msgJoinPrivate } from "@messages/subscriberMessages";

const GeneralComposer = new Composer();

GeneralComposer.command("start", async ctx => {

    await ctx.reply(
        startMessage,
        { 
            parse_mode: "HTML",
            link_preview_options: { is_disabled: true }
        }
    );

	if(ctx.chat.type === "private") {
        await UserServices.saveUser(ctx.chat.id.toString());

        const joinArgs = ctx.match.split("_");

        if(ctx.match.length > 0 && joinArgs.length === 2) {
            
            const userId = ctx.chat.id.toString();
            const groupId = joinArgs[0];
            const tagName = joinArgs[1];

            const result = await SubscriberServices.joinTag(groupId, tagName, userId);

            if(result.isSuccess()) {
                await ctx.reply(msgJoinPrivate(tagName), { parse_mode: "HTML" });
            }
            else {
                const message = "⚠️ " + result.error.message;
                await ctx.reply(message);
            }
        }
    }
    
});

GeneralComposer.command("help", async ctx => {
    await ctx.reply(helpMessage, { parse_mode: "HTML" });
});

GeneralComposer.command("restart", checkIfGroup, checkIfAdmin, async ctx => {

    const groupId = ctx.chat.id.toString();
    //reload the admin list of the group
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const result = await GroupServices.reloadAdminList(groupId, adminList.map(admin => admin.user.id));

    if(result.isSuccess()) {
        await ctx.reply(restartSuccessMessage);
    }
    else {
        console.log(result.error);
        await ctx.reply(restartErrorMessage);
    }
});

GeneralComposer.on("my_chat_member", async ctx => {

    const chatType = ctx.chat.type;
    const oldStatus = ctx.myChatMember.old_chat_member.status;
    const newStatus = ctx.myChatMember.new_chat_member.status;

    const groupId = ctx.chat.id.toString();

    if(chatType !== "private") {

        //Bot added to the group or supergroup
        if((oldStatus === "left" || oldStatus == "kicked") && (newStatus === "member" || newStatus === "administrator")) {
            const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
            const result = await GroupServices.createGroup(ctx.chat.title, groupId, adminList.map(admin => admin.user.id));


            if(result.isSuccess()) {
                await ctx.reply(startMessage, { parse_mode: "HTML" });
            }
            else if(result.error.message === "ALREADY_EXISTS"){
                console.log("group already exists");
                await GroupServices.toggleGroupActive(groupId);
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
            await GroupServices.deleteAdminList(groupId);
            await GroupServices.toggleGroupActive(groupId);
        }
            
    }
    else if(chatType === "private" && newStatus !== "member") {
        await UserServices.deleteUser(groupId.toString());
    }
});

GeneralComposer.on(":migrate_to_chat_id", async ctx => {

    const oldGroupId = ctx.chat.id.toString();
    const newGroupId = ctx.msg.migrate_to_chat_id.toString();

    const result = await GroupServices.migrateGroup(oldGroupId, newGroupId);
    if(result.isSuccess())
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateSuccessMessage);
    else 
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, migrateErrorMessage);
});


GeneralComposer.on("chat_member", async ctx => {

    const oldStatus = ctx.chatMember.old_chat_member.status;
    const newStatus = ctx.chatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();


    //Add admin
    if(oldStatus === "member" && newStatus === "administrator" && !ctx.chatMember.new_chat_member.user.is_bot)
        await GroupServices.addAdmin(groupId, ctx.chatMember.new_chat_member.user.id);
    
    //Remove admin
    if(oldStatus === "administrator" && ["member","left","kicked"].includes(newStatus) && !ctx.chatMember.new_chat_member.user.is_bot)
        await GroupServices.removeAdmin(groupId, ctx.chatMember.old_chat_member.user.id);


    if(["member","administrator","creator"].includes(oldStatus) && ["kicked","left"].includes(newStatus) && !ctx.chatMember.new_chat_member.user.is_bot)
        await SubscriberServices.setInactive(groupId, ctx.chatMember.old_chat_member.user.id);

    if(["kicked","left"].includes(oldStatus) && ["member","administrator","creator"].includes(newStatus) && !ctx.chatMember.new_chat_member.user.is_bot)
        await SubscriberServices.setActive(groupId, ctx.chatMember.new_chat_member.user.id);

});

export default GeneralComposer;