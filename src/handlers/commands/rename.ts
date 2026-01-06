import { MyContext } from "utils/customTypes";
import TagRepository from "db/tag/tag.repository";
import GroupRepository from "db/group/group.repository";

import { tagPrivately } from "utils/tagPrivately";

export async function renameHandler(ctx: MyContext) {

    const tagRepository = new TagRepository();
    const groupRepository = new GroupRepository();

    // Take parameters
    const args = ctx.match.toString();
    const [oldTagName, newTagName] = args.trim().split(/\s+/).map(tag => tag.replace(/^#/, ""));
    const groupId = ctx.chatId.toString();
    const groupName = ctx.msg.chat.title;

    // Validate parameters
    if (!oldTagName || !newTagName)
        return await ctx.reply(ctx.t("tag.rename-syntax"), {parse_mode: "HTML"});


    const regex = /^(?=[^A-Za-z]*[A-Za-z])[#]{0,1}[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;
    if(!regex.test(oldTagName) || !regex.test(newTagName)) 
        return await ctx.reply(ctx.t("tag.validation-syntax"), {parse_mode: "HTML"}); 

    // Get group
    const group = await groupRepository.getGroup(groupId);

    // Check if the tag exists
    const tag = await tagRepository.get(group.id, oldTagName);
    if(tag === null) {
        return await ctx.reply(ctx.t("tag.validation-not-found", {tagName: oldTagName, count: 1}), {parse_mode: "HTML"});
    }

    // Check if the new tag name already exists
    const tagExists = await tagRepository.get(group.id, newTagName);
    if(tagExists !== null) {
        return await ctx.reply(ctx.t("tag.validation-already-exists", {tagName: newTagName}), {parse_mode: "HTML"});
    }

    // Rename the tag and send the confirmation message
    await tagRepository.rename(group.id, oldTagName, newTagName);
    const sentMessage = await ctx.reply(ctx.t("tag.rename-ok", {oldTagName, newTagName}) , {parse_mode: "HTML"});
    
    // NOTIFY SUBSCRIBERS OF THE TAG RENAMING
    const subscribers = await tagRepository.getSubscribers(group.id, newTagName);
    const subscribersWithoutMe = subscribers.filter(subscriber => subscriber.userId !== ctx.from.id.toString());
    
    if(subscribersWithoutMe.length > 0) {
        //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
        if(subscribersWithoutMe.length > 10) {
            const message = await tagPrivately(ctx, newTagName, groupName, subscribersWithoutMe, sentMessage.message_id);
            await ctx.reply(message, { 
                reply_parameters: { message_id: sentMessage.message_id },
                parse_mode: "HTML",
                link_preview_options: { is_disabled: true }
            });
        }
        else {
            const message = subscribersWithoutMe.map(s => `<a href="tg://user?id=${s.userId}">@${s.username}</a>`).join(" ");
            await ctx.reply(message, { reply_parameters: { message_id: sentMessage.message_id }, parse_mode: "HTML" });
        }
    }
}