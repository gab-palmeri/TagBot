import { MyContext } from "@utils/customTypes";

import { InlineKeyboard } from "grammy";

import { msgJoinPublic, msgJoinStartBot, msgJoinSyntaxError } from "@messages/subscriberMessages";

import SubscriberRepository from "db/subscriber/subscriber.repository";
import TagRepository from "@db/tag/tag.repository";
import UserRepository from "@db/user/user.repository";


const subscriberRepository = new SubscriberRepository();
const userRepository = new UserRepository();
const tagRepository = new TagRepository();

//TODO: shares much in common with joinTagCommandHandler - refactor
export async function joinTagCallbackQueryHandler(ctx: MyContext) {
    if(ctx.callbackQuery.message.chat.type !== "private") {
    
        const tagName = ctx.callbackQuery.data.split("_")[1];
        const groupId = ctx.callbackQuery.message.chat.id.toString();
        const username = ctx.callbackQuery.from.username;
        const userId = ctx.callbackQuery.from.id.toString();

        if(tagName.length == 0) 
            return await ctx.reply(msgJoinSyntaxError);
        
        // Invoke service
        const userResult = await userRepository.getUser(userId);

        // Handle response
        if(userResult.ok === false) {
            switch(userResult.error) {
                case "NOT_FOUND": {
                    const [msg, inlineKeyboardUrlText] = msgJoinStartBot(username);
                    const inlineKeyboard = new InlineKeyboard().url(inlineKeyboardUrlText, `https://t.me/${ctx.me.username}?start=${groupId}_${tagName}`);
                    return await ctx.reply(msg, { parse_mode: "HTML", reply_markup: inlineKeyboard });
                }
                case "DB_ERROR": {
                    return await ctx.reply("⚠️ An internal error occurred");
                }
            }
        }

        // Invoke service
        const tag = await tagRepository.get(groupId, tagName);
        if(tag.ok === false) {
            switch(tag.error) {
                case "NOT_FOUND":
                    return await ctx.reply(`⚠️ Tag #${tagName} not found in this group, @${username}`);
                case "DB_ERROR":
                    return await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
            }
        }

        const joinResult = await subscriberRepository.joinTag(groupId, tagName, userId);

        if(joinResult.ok === true) {
            const [msg, inlineKeyboardText] = msgJoinPublic(tagName, username);
            const inlineKeyboard = new InlineKeyboard().text(inlineKeyboardText, `join-tag_${tagName}`);
            await ctx.reply(msg, { reply_markup: inlineKeyboard });
        }
        else {

            switch(joinResult.error) {
                case "ALREADY_EXISTS":
                    await ctx.reply("⚠️ You are already subscribed to tag #" + tagName + ", @" + username);
                    break;
                case "DB_ERROR":
                    await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
                    break;
            }
        }

        return await ctx.answerCallbackQuery("Done!");
    }
}