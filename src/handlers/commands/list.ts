import { MyContext } from "@utils/customTypes";
import { InlineKeyboard } from "grammy";
import { msgListTags } from "@messages/subscriberMessages";
import { organizeTagsList } from "@utils/organizeTagsList";


export async function listHandler(ctx: MyContext) {

    // Take parameters
    const groupId = ctx.chatId.toString();

    // Invoke repository
    const tagsByGroupResponse = await organizeTagsList(groupId);

    // Handle response
    if(tagsByGroupResponse === "DB_ERROR") {
        return await ctx.reply("⚠️ An internal error occurred while retrieving the tags.");
    }

    if(tagsByGroupResponse.mainTags.length === 0) {
        return await ctx.reply("⚠️ No tags found in this group.");
    }

    const mostActiveTags = tagsByGroupResponse.mainTags;
    const nextTags = tagsByGroupResponse.secondaryTags;
    
    // Create the message to send
    const message = msgListTags(mostActiveTags, nextTags);
    const inlineKeyboard = new InlineKeyboard().text("See all tags", `show-all-tags`);
    await ctx.reply(message, { reply_markup: inlineKeyboard, parse_mode: "HTML" });
}
