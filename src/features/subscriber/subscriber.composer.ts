import { Composer, InlineKeyboard } from "grammy";
import { checkIfGroup } from "shared/middlewares";
import { MyContext } from "@utils/customTypes";

import SubscriberServices from "features/subscriber/subscriber.services";

import { msgJoinPublic, msgJoinStartBot, msgJoinSyntaxError, msgLeaveSyntaxError, msgLeaveTag, msgMyTags } from "@messages/subscriberMessages";
import SubscriberRepository from "./subscriber.repository";

const SubscriberComposer = new Composer<MyContext>();
const subscriberService = new SubscriberServices(new SubscriberRepository());


SubscriberComposer.command("join", checkIfGroup, async ctx => {

    const tagName = ctx.match.toString();
    const groupId = ctx.update.message.chat.id.toString();
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    if(tagName.length == 0) 
        return await ctx.reply(msgJoinSyntaxError);
    
    const joinResult = await subscriberService.joinTag(groupId, tagName, userId);

    if(joinResult.ok === true) {
        const [msg, inlineKeyboardText] = msgJoinPublic(tagName, username);
        const inlineKeyboard = new InlineKeyboard().text(inlineKeyboardText, `join-tag_${tagName}`);

        await ctx.reply(msg, { reply_markup: inlineKeyboard });
    }
    else {

        const [msg, inlineKeyboardUrlText] = msgJoinStartBot(username);
        const inlineKeyboard = new InlineKeyboard().url(inlineKeyboardUrlText, `https://t.me/${ctx.me.username}?start=${groupId}_${tagName}`);

        switch(joinResult.error) {
            case "BOT_NOT_STARTED":
                await ctx.reply(msg, { reply_markup: inlineKeyboard });
                break;
            case "ALREADY_EXISTS":
                await ctx.reply("⚠️ You are already subscribed to tag #" + tagName + ", @" + username);
                break;
            case "NOT_FOUND":
                await ctx.reply(`⚠️ Tag #${tagName} not found in this group, @${username}`);
                break;
            case "INTERNAL_ERROR":
                await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
                break;
        }
    }
});

SubscriberComposer.callbackQuery(/^join-tag_/, async (ctx) => {

    if(ctx.callbackQuery.message.chat.type !== "private") {

        const tagName = ctx.callbackQuery.data.split("_")[1];
        const groupId = ctx.callbackQuery.message.chat.id.toString();
        const username = ctx.callbackQuery.from.username;
        const userId = ctx.callbackQuery.from.id.toString();

        if(tagName.length == 0) 
            return await ctx.reply(msgJoinSyntaxError);

        const joinResult = await subscriberService.joinTag(groupId, tagName, userId);

        if(joinResult.ok === true) {
            const [msg, inlineKeyboardText] = msgJoinPublic(tagName, username);
            const inlineKeyboard = new InlineKeyboard().text(inlineKeyboardText, `join-tag_${tagName}`);
            await ctx.reply(msg, { reply_markup: inlineKeyboard });
        }
        else {
            const [msg, inlineKeyboardUrlText] = msgJoinStartBot(username);
            const inlineKeyboard = new InlineKeyboard().url(inlineKeyboardUrlText, `https://t.me/${ctx.me.username}?start`);

            switch(joinResult.error) {
                case "BOT_NOT_STARTED":
                    await ctx.reply(msg, { reply_markup: inlineKeyboard });
                    break;
                case "ALREADY_EXISTS":
                    await ctx.reply("⚠️ You are already subscribed to tag #" + tagName + ", @" + username);
                    break;
                case "NOT_FOUND":
                    await ctx.reply(`⚠️ Tag #${tagName} not found in this group, @${username}`);
                    break;
                case "INTERNAL_ERROR":
                    await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
                    break;
            }
        }

        return await ctx.answerCallbackQuery("Done!");
    }
    
});


SubscriberComposer.command("leave", checkIfGroup, async ctx => {

    const tagName = ctx.match.toString();
    const groupId = ctx.update.message.chat.id.toString();
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    if(tagName.length == 0)
        return await ctx.reply(msgLeaveSyntaxError);

    const result = await subscriberService.leaveTag(groupId, tagName, userId);

    if(result.ok === true) {
        await ctx.reply(msgLeaveTag(username, tagName));
    }
    else {
        switch(result.error) {
            case "NOT_FOUND":
                await ctx.reply(`⚠️ You are not subscribed to tag #${tagName}, @${username}`);
                break;
            case "INTERNAL_ERROR":
                await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
                break;
        }
    }
});

//TODO: FIX
SubscriberComposer.callbackQuery("show-all-tags", async (ctx) => {

    const userId = ctx.update.callback_query.from.id.toString();
    
    // Ottieni tutti i tag del gruppo
    const fullMessage = ctx.update.callback_query.data.split("_")[1];

    // Invia il messaggio in privato
    await ctx.api.sendMessage(userId, fullMessage, { parse_mode: "HTML" });
    await ctx.answerCallbackQuery("Full tags list sent in private!");
  
});

//function that returns the tags the user is subcribed in
SubscriberComposer.command("mytags", checkIfGroup, async ctx => {
    
    const groupId = ctx.update.message.chat.id.toString();
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    const result = await subscriberService.getSubscriberTags(userId, groupId);

    if(result.ok === true) {
        const tags = result.value;

        await ctx.reply(msgMyTags(tags, username), { parse_mode: "HTML" });
    }
    else {
        switch(result.error) {
            case "NOT_FOUND":
                await ctx.reply(`⚠️ You are not subscribed to any tags in this group, @${username}`);
                break;
            case "INTERNAL_ERROR":
                await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
                break;
        }
    }
});


SubscriberComposer.on("chat_member", async ctx => {

    const oldStatus = ctx.chatMember.old_chat_member.status;
    const newStatus = ctx.chatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();

    const isBot = ctx.chatMember.new_chat_member.user.is_bot;

    if(!isBot) {
        if(["member","administrator","creator"].includes(oldStatus) && ["kicked","left"].includes(newStatus))
            await subscriberService.setInactive(groupId, ctx.chatMember.old_chat_member.user.id);

        if(["kicked","left"].includes(oldStatus) && ["member","administrator","creator"].includes(newStatus))
            await subscriberService.setActive(groupId, ctx.chatMember.new_chat_member.user.id);
    }
});



SubscriberComposer.on("message", checkIfGroup, async ctx => {

    const result = await subscriberService.getSubscriber(ctx.from.id.toString());

    //Check that the subscriber.username is equal to the ctx.from.username
    if(result.ok === true) {
        if(result.value.username !== ctx.from.username) {
            //If not, update the subscriber
            await subscriberService.updateSubscriberUsername(ctx.from.id.toString(), ctx.from.username);
        }
    }
});




export default SubscriberComposer;