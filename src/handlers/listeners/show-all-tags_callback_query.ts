import { MyContext } from "@utils/customTypes";
import { msgListTags } from "@utils/messages/subscriberMessages";
import { organizeTagsList } from "@utils/organizeTagsList";

export async function showAllTagsCallbackQueryHandler(ctx: MyContext) {

    //this function takes the userId and sends a complete tag list in private
    if(ctx.callbackQuery.message.chat.type !== "private") {

        const groupId = ctx.chatId.toString();
        const groupName = ctx.chat.title;
        const username = ctx.from.username;
        const userId = ctx.from.id.toString();

        // Invoke repository
        const tagsResult = await organizeTagsList(groupId, false);

        if(tagsResult.ok === true) {
            const mostActiveTags = tagsResult.value.mainTags;
            const nextTags = tagsResult.value.secondaryTags;

            // Create the message to send
            const message = msgListTags(mostActiveTags, nextTags, groupName);

            // Send the message in private
            try {
                await ctx.api.sendMessage(userId, message, { parse_mode: "HTML" });
                // Acknowledge the callback query
                await ctx.answerCallbackQuery({
                    text: `✅ I've sent you a private message with all the tags!`,
                    show_alert: true
                });
            } catch (e) {
                // If the bot can't send a message to the user (e.g., because the user hasn't started a chat with the bot)
                await ctx.answerCallbackQuery({
                    text: `⚠️ @${username}, I couldn't send you a private message. Please start a chat with me first`,
                    show_alert: true
                });
            }
        }
        else {
            switch(tagsResult.error) {
                case "NOT_FOUND":
                    return await ctx.answerCallbackQuery({
                        text: `⚠️ @${username}, there are no tags in this group.`,
                        show_alert: true
                    });
                case "INTERNAL_ERROR":
                    return await ctx.answerCallbackQuery({
                        text: `⚠️ @${username}, an internal error occurred while retrieving the tags.`,
                        show_alert: true
                    });
            }
        }
    }
        
}