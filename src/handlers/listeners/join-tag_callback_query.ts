import { MyContext } from "@utils/customTypes";

import { InlineKeyboard } from "grammy";

import { msgJoinSyntaxError } from "@messages/subscriberMessages";

import { joinTag } from "@utils/joinTag";


export async function joinTagCallbackQueryHandler(ctx: MyContext) {
    if(ctx.callbackQuery.message.chat.type !== "private") {
    
        const tagName = ctx.callbackQuery.data.split("_")[1];
        const groupId = ctx.callbackQuery.message.chat.id.toString();
        const username = ctx.callbackQuery.from.username;
        const userId = ctx.callbackQuery.from.id.toString();

        if(tagName.length == 0) 
            return await ctx.reply(msgJoinSyntaxError);
        
        const joinResult = await joinTag(tagName, groupId, username, userId);

        if (joinResult.inlineKeyboard) {
            const kb = new InlineKeyboard();
            if (joinResult.inlineKeyboard.url) kb.url(joinResult.inlineKeyboard.text, joinResult.inlineKeyboard.url);
            if (joinResult.inlineKeyboard.callbackData) kb.text(joinResult.inlineKeyboard.text, joinResult.inlineKeyboard.callbackData);
            await ctx.reply(joinResult.message, { reply_markup: kb, parse_mode: "HTML" });
        } else {
            await ctx.reply(joinResult.message);
        }

        return await ctx.answerCallbackQuery("Done!");
    }
}