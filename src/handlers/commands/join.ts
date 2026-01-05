import { MyContext } from "utils/customTypes";
import { InlineKeyboard } from "grammy";

import { joinTag } from "utils/joinTag";


export async function joinHandler(ctx: MyContext) {

    // Take parameters
    const tagName = ctx.match.toString().trim().replace(/^#/, '');
    const groupId = ctx.chatId.toString();
    const userId = ctx.from.id.toString();
    const username = ctx.from.username || ctx.from.first_name;
    const botUsername = ctx.me.username;


    // Validate parameters
    if(tagName.length == 0) 
        return await ctx.reply(ctx.t("join.syntax"), {parse_mode: "Markdown"});

    const joinResult = await joinTag(ctx.t, tagName, groupId, username, botUsername, userId);

    if (joinResult.inlineKeyboard) {
        const kb = new InlineKeyboard();
        if (joinResult.inlineKeyboard.url) 
            kb.url(joinResult.inlineKeyboard.text, joinResult.inlineKeyboard.url);
        if (joinResult.inlineKeyboard.callbackData) 
            kb.text(joinResult.inlineKeyboard.text, joinResult.inlineKeyboard.callbackData);
        await ctx.reply(joinResult.message, { reply_markup: kb, parse_mode: "Markdown" });
    } else {
        await ctx.reply(joinResult.message, { parse_mode: "Markdown" });
    }
}