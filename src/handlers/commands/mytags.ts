import { composeTagList } from "@utils/composeTagsList";
import { MyContext } from "@utils/customTypes";
import SubscriberRepository from "db/subscriber/subscriber.repository";

export async function mytagsHandler(ctx: MyContext) {
    const subscriberRepository = new SubscriberRepository();

    // Take parameters
    const groupId = ctx.chatId.toString();
    const username = ctx.from.username || ctx.from.first_name;
    const userId = ctx.from.id.toString();

    const result = await subscriberRepository.getSubscriberTags(userId, groupId);
                
    if(result.length === 0) {
        return await ctx.reply(`⚠️ You are not subscribed to any tags in this group, @${username}`);
    }

    const tags = result.sort((a,b) => a.name.localeCompare(b.name));

    const myTags = composeTagList(ctx, { tags, username, fullList: false });

    await ctx.reply(myTags, { parse_mode: "Markdown" });
    
}