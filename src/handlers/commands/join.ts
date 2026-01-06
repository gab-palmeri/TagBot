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

    const joinResult = await joinTag(tagName, groupId, userId);

    switch (joinResult) {
        case "START_BOT": {
            const msg = ctx.t("join.start-bot-msg");
            const startUrl = `https://t.me/${botUsername}?start=${groupId}_${tagName}`;

            const kb = new InlineKeyboard().url(
                ctx.t("join.start-bot-btn"),
                startUrl
            );
            return ctx.reply(msg, { reply_markup: kb, parse_mode: "Markdown"});
        }

        case "TAG_NOT_FOUND": {
            const msg = ctx.t("tag.validation-not-found", { tagName, count: 1 });
            return ctx.reply(msg, {parse_mode: "Markdown"});
        }

        case "ALREADY_SUBSCRIBED": {
            const msg = ctx.t("join.already-subscribed", { tagName });
            return ctx.reply(msg, {parse_mode: "Markdown"});
        }

        case "JOINED": {
            const msg = ctx.t("join.ok", { tagName, username });
            const kb = new InlineKeyboard().text(
                ctx.t("join.btn"),
                `join-tag_${tagName}`
            );
            return ctx.reply(msg, { reply_markup: kb, parse_mode: "Markdown"});
        }
    }
}