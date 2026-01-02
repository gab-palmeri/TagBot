import { MyContext } from "@utils/customTypes";
import SubscriberRepository from "db/subscriber/subscriber.repository";
import { msgLeaveSyntaxError, msgLeaveTag } from "@messages/subscriberMessages";
import TagRepository from "@db/tag/tag.repository";

export async function leaveHandler(ctx: MyContext) {

    const subscriberRepository = new SubscriberRepository();
    const tagRepository = new TagRepository();

    // Take parameters
    const tagName = ctx.match.toString().trim().replace(/^#/, '');
    const groupId = ctx.chatId.toString();
    const username = ctx.from.username || ctx.from.first_name;
    const userId = ctx.from.id.toString();

    // Validate parameters
    if(tagName.length == 0) {
        return await ctx.reply(msgLeaveSyntaxError);
    }
    // Check if tag exists
    const tag = await tagRepository.get(groupId, tagName);
    if(tag === null) {
        return await ctx.reply("⚠️ The tag #" + tagName + " does not exist in this group, @" + username);
    }

    // Check if user is subscribed to the tag
    const isSubscribed = await subscriberRepository.isSubscribedToTag(groupId, tagName, userId);
    if(!isSubscribed) {
        return await ctx.reply("⚠️ You are not subscribed to the tag " + tagName + ", @" + username);
    }

    // Leave tag
    await subscriberRepository.leaveTag(groupId, tagName, userId);
    await ctx.reply(msgLeaveTag(username, tagName));

}