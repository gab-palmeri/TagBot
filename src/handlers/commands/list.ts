import { MyContext } from "@utils/customTypes";
import { InlineKeyboard } from "grammy";
import { organizeTagsList } from "@utils/organizeTagsList";
import { composeTagList } from "@utils/composeTagsList";


export async function listHandler(ctx: MyContext) {

    // Take parameters
    const groupId = ctx.chatId.toString();

    // Invoke repository
    const tagsByGroupResponse = await organizeTagsList(groupId);

    if(tagsByGroupResponse.mainTags.length === 0) {
        return await ctx.reply(ctx.t("list.empty"), {parse_mode: "Markdown"});
    }

    const mostActiveTags = tagsByGroupResponse.mainTags;
    const nextTags = tagsByGroupResponse.secondaryTags;
  
    // Create the message to send
    const message = composeTagList(ctx, { mainTags: mostActiveTags, otherTags: nextTags, fullList: false });



    const inlineKeyboard = new InlineKeyboard().text("See all tags", `show-all-tags`);
    await ctx.reply(message, { reply_markup: inlineKeyboard, parse_mode: "Markdown" });
}
