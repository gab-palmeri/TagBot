import { MyContext } from "@utils/customTypes";
import SubscriberServices from "features/subscriber/subscriber.services";
import SubscriberRepository from "features/subscriber/subscriber.repository";
import { msgMyTags } from "@messages/subscriberMessages";

export async function mytagsHandler(ctx: MyContext) {
    const subscriberService = new SubscriberServices(new SubscriberRepository());

    const groupId = ctx.update.message.chat.id.toString();
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    const result = await subscriberService.getSubscriberTags(userId, groupId);

    if(result.ok === true) {
        const tags = result.value;

        await ctx.reply(msgMyTags(tags, username), { parse_mode: "HTML" });
    }
    else {
        switch(result.error) {
            case "NOT_FOUND":
                await ctx.reply(`⚠️ You are not subscribed to any tags in this group, @${username}`);
                break;
            case "INTERNAL_ERROR":
                await ctx.reply("⚠️ An internal error occurred, please try again later, @" + username);
                break;
        }
    }
}