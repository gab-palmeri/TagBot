import { MyContext } from "@utils/customTypes";
import SubscriberRepository from "db/subscriber/subscriber.repository";
import { msgMyTags } from "@messages/subscriberMessages";

export async function mytagsHandler(ctx: MyContext) {
    const subscriberRepository = new SubscriberRepository();

    // Take parameters
    const groupId = ctx.chatId.toString();
    const username = ctx.from.username || ctx.from.first_name;
    const userId = ctx.from.id.toString();

    // Invoke service
    const result = await subscriberRepository.getSubscriberTags(userId, groupId);

    // Handle response
    if(result.ok === true) {
        
        if(result.value.length === 0) {
            return await ctx.reply(`⚠️ You are not subscribed to any tags in this group, @${username}`);
        }

        const tags = result.value.sort((a,b) => a.name.localeCompare(b.name));
        await ctx.reply(msgMyTags(tags, username), { parse_mode: "HTML" });
    }
    else {
        return await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
    }
}