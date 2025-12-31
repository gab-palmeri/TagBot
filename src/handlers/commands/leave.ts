import { MyContext } from "@utils/customTypes";
import SubscriberRepository from "db/subscriber/subscriber.repository";
import { msgLeaveSyntaxError, msgLeaveTag } from "@messages/subscriberMessages";

export async function leaveHandler(ctx: MyContext) {

    const subscriberRepository = new SubscriberRepository();

    // Take parameters
    const tagName = ctx.match.toString().trim().replace(/^#/, '');
    const groupId = ctx.chatId.toString();
    const username = ctx.from.username || ctx.from.first_name;
    const userId = ctx.from.id.toString();

    // Validate parameters
    if(tagName.length == 0) {
        return await ctx.reply(msgLeaveSyntaxError);
    }

    // Invoke repository
    const result = await subscriberRepository.leaveTag(groupId, tagName, userId);

    // Handle response
    if(result.ok === true) {
        await ctx.reply(msgLeaveTag(username, tagName));
    }
    else {
        switch(result.error) {
            case "NOT_FOUND":
                await ctx.reply(`⚠️ You are not subscribed to tag #${tagName}, @${username}`);
                break;
            case "DB_ERROR":
                await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
                break;
        }
    }
}