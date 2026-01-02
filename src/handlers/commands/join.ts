import { MyContext } from "@utils/customTypes";
import { InlineKeyboard } from "grammy";
import { msgJoinSyntaxError } from "@messages/subscriberMessages";

import { joinTag } from "@utils/joinTag";


export async function joinHandler(ctx: MyContext) {

    // Take parameters
    const tagName = ctx.match.toString().trim().replace(/^#/, '');
    const groupId = ctx.chatId.toString();
    const username = ctx.from.username || ctx.from.first_name;
    const userId = ctx.from.id.toString();

    // Validate parameters
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
}