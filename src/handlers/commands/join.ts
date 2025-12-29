import { MyContext } from "@utils/customTypes";
import { InlineKeyboard } from "grammy";
import SubscriberServices from "features/subscriber/subscriber.services";
import SubscriberRepository from "features/subscriber/subscriber.repository";
import { msgJoinPublic, msgJoinStartBot, msgJoinSyntaxError } from "@messages/subscriberMessages";

import UserRepository from "features/user/user.repository";
import UserServices from "features/user/user.services";


export async function joinHandler(ctx: MyContext) {

    const subscriberService = new SubscriberServices(new SubscriberRepository());
    const userService = new UserServices(new UserRepository());


    const tagName = ctx.match.toString();
    const groupId = ctx.update.message.chat.id.toString();
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    if(tagName.length == 0) 
        return await ctx.reply(msgJoinSyntaxError);

    const userResult = await userService.getUser(userId);

    if(userResult.ok === false) {
        switch(userResult.error) {
            case "NOT_FOUND": {
                const [msg, inlineKeyboardUrlText] = msgJoinStartBot(username);
                const inlineKeyboard = new InlineKeyboard().url(inlineKeyboardUrlText, `https://t.me/${ctx.me.username}?start=${groupId}_${tagName}`);
                return await ctx.reply(msg, { parse_mode: "HTML", reply_markup: inlineKeyboard });
            }
            case "INTERNAL_ERROR": {
                return await ctx.reply("⚠️ An internal error occurred");
            }
        }
    }
    
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
}