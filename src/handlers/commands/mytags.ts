import GroupRepository from "db/group/group.repository";
import { composeTagList } from "utils/composeTagsList";
import { MyContext } from "utils/customTypes";
import SubscriberRepository from "db/subscriber/subscriber.repository";

export async function mytagsHandler(ctx: MyContext) {
    const subscriberRepository = new SubscriberRepository();
    const groupRepository = new GroupRepository();


    // Take parameters
    const groupId = ctx.chatId.toString();
    const username = ctx.from.username || ctx.from.first_name;
    const userId = ctx.from.id.toString();

    // Get group
    const group = await groupRepository.getGroup(groupId);

    // Get tags
    const result = await subscriberRepository.getSubscriberTags(userId, group.id);
                
    if(result.length === 0) {
        return await ctx.reply(ctx.t("mytags.empty", {username}), {parse_mode: "Markdown"});
    }

    const tags = result.sort((a,b) => a.name.localeCompare(b.name));

    const myTags = composeTagList(ctx, { tags, username, fullList: false });

    await ctx.reply(myTags, { parse_mode: "Markdown" });
    
}