import { composeTagList } from "utils/composeTagsList";
import { MyContext } from "utils/customTypes";
import { organizeTagsList } from "utils/organizeTagsList";

export async function showAllTagsCallbackQueryHandler(ctx: MyContext) {

    //this function takes the userId and sends a complete tag list in private
    if(ctx.callbackQuery.message.chat.type !== "private") {

        const groupId = ctx.chatId.toString();
        const groupName = ctx.chat.title;
        const username = ctx.from.username;
        const userId = ctx.from.id.toString();

        let tagsResult;

        // Invoke repository
        try {
            tagsResult = await organizeTagsList(groupId, false);
        }
        catch(e) {
            await ctx.answerCallbackQuery({
                text: `⚠️ @${username}, an internal error occurred while retrieving the tags.`,
                show_alert: true
            });
            throw e;
        }

        if(tagsResult.mainTags.length === 0) {
            return await ctx.answerCallbackQuery({
                text: `⚠️ @${username}, there are no tags in this group.`,
                show_alert: true
            });
        }

        const mostActiveTags = tagsResult.mainTags;
        const nextTags = tagsResult.secondaryTags;

        // Create the message to send
        const message = composeTagList(ctx, { tags: mostActiveTags, otherTags: nextTags, groupName, fullList: true });


        // Send the message in private
        try {
            await ctx.api.sendMessage(userId, message, { parse_mode: "Markdown" });
            await ctx.answerCallbackQuery({
                text: ctx.t("list-callback-success"),
                show_alert: true
            });
        } catch (e) {
            // If the bot can't send a message to the user (e.g., because the user hasn't started a chat with the bot)
            await ctx.answerCallbackQuery({
                text: ctx.t("list-callback-error"),
                show_alert: true
            });
        }
    }
        
}