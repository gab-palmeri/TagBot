import { MyContext } from "@utils/customTypes";
import SubscriberServices from "features/subscriber/subscriber.services";
import SubscriberRepository from "features/subscriber/subscriber.repository";
import { msgLeaveSyntaxError, msgLeaveTag } from "@messages/subscriberMessages";




export async function leaveHandler(ctx: MyContext) {

    const subscriberService = new SubscriberServices(new SubscriberRepository());

    const tagName = ctx.match.toString();
    const groupId = ctx.update.message.chat.id.toString();
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    if(tagName.length == 0)
        return await ctx.reply(msgLeaveSyntaxError);

    const result = await subscriberService.leaveTag(groupId, tagName, userId);

    if(result.ok === true) {
        await ctx.reply(msgLeaveTag(username, tagName));
    }
    else {
        switch(result.error) {
            case "NOT_FOUND":
                await ctx.reply(`⚠️ You are not subscribed to tag #${tagName}, @${username}`);
                break;
            case "INTERNAL_ERROR":
                await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
                break;
        }
    }
}