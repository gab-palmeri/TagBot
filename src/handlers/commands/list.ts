import { MyContext } from "@utils/customTypes";
import { InlineKeyboard } from "grammy";
import TagServices from "features/tag/tag.services";
import TagRepository from "features/tag/tag.repository";
import { msgListTags } from "@messages/subscriberMessages";


export async function listHandler(ctx: MyContext) {

    const tagService = new TagServices(new TagRepository());

    const groupId = ctx.update.message.chat.id.toString();
    const tagsByGroupResponse = await tagService.getTagsByGroup(groupId);

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