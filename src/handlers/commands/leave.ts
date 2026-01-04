import { MyContext } from "@utils/customTypes";
import SubscriberRepository from "db/subscriber/subscriber.repository";
import TagRepository from "@db/tag/tag.repository";
import GroupRepository from "@db/group/group.repository";

export async function leaveHandler(ctx: MyContext) {

    const subscriberRepository = new SubscriberRepository();
    const tagRepository = new TagRepository();
    const groupRepository = new GroupRepository();



    // Take parameters
    const tagName = ctx.match.toString().trim().replace(/^#/, '');
    const groupId = ctx.chatId.toString();
    const username = ctx.from.username || ctx.from.first_name;
    const userId = ctx.from.id.toString();

    // Validate parameters
    if(tagName.length == 0) {
        return await ctx.reply(ctx.t("leave-syntax-error"), {parse_mode: "Markdown"});
    }

    // Get group
    const group = await groupRepository.getGroup(groupId);

    // Check if tag exists
    const tag = await tagRepository.get(group.id, tagName);
    if(tag === null) {
        return await ctx.reply(ctx.t("tag-not-found", {tagName}));
    }

    // Check if user is subscribed to the tag
    const isSubscribed = await subscriberRepository.isSubscribedToTag(groupId, tagName, userId);
    if(!isSubscribed) {
        return await ctx.reply(ctx.t("not-subscribed-error", {username, tagName}), {parse_mode: "Markdown"});
    }

    // Leave tag
    await subscriberRepository.leaveTag(groupId, tagName, userId);
    await ctx.reply(ctx.t("leave-tag", {username, tagName}), {parse_mode: "Markdown"});

}