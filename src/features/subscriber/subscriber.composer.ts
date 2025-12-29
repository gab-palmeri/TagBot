import { Composer, InlineKeyboard } from "grammy";
import { checkIfGroup } from "shared/middlewares";
import { MyContext } from "@utils/customTypes";

import SubscriberServices from "features/subscriber/subscriber.services";

import { msgJoinPublic, msgJoinStartBot, msgJoinSyntaxError, msgLeaveSyntaxError, msgLeaveTag, msgMyTags } from "@messages/subscriberMessages";
import SubscriberRepository from "./subscriber.repository";

const SubscriberComposer = new Composer<MyContext>();
const subscriberService = new SubscriberServices(new SubscriberRepository());


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






export default SubscriberComposer;