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
    if(tagsByGroupResponse.ok === true) {
        const mostActiveTags = tagsByGroupResponse.value.mainTags;
        const nextTags = tagsByGroupResponse.value.secondaryTags;
        
        // Create the message to send
        const message = msgListTags(mostActiveTags, nextTags);
        const inlineKeyboard = new InlineKeyboard().text("See all tags", `show-all-tags`);
        await ctx.reply(message, { reply_markup: inlineKeyboard, parse_mode: "HTML" });
    }
    else {
        switch(tagsByGroupResponse.error) {
            case "NOT_FOUND":
                return await ctx.reply("⚠️ No tags found in this group.");
            case "INTERNAL_ERROR":
                return await ctx.reply("⚠️ An internal error occurred while retrieving the tags.");
        }
    }
}
