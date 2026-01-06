import { MyContext } from "utils/customTypes";
import TagRepository from "db/tag/tag.repository";
import GroupRepository from "db/group/group.repository";

import { isUserFlooding } from "utils/isUserFlooding";
import { tagPrivately } from "utils/tagPrivately";

export async function hashtagHandler(ctx: MyContext) {

    const tagRepository = new TagRepository();
    const groupRepository = new GroupRepository();

    if(ctx.msg.forward_origin !== undefined)
        return;

    // Take parameters
    const tagNames = ctx.entities().filter(entity => entity.type == "hashtag").map(e => e.text.replace(/^#/, ""));
    const messageToReplyTo = ctx.msg.message_id;
    const groupId = ctx.update.message.chat.id.toString();

    await ctx.react("👀");

    // Initialize arrays
    const emptyTags = [];
    const nonExistentTags = [];
    const onlyOneInTags = [];
    let isFlooding = false;

    // Get group
    const group = await groupRepository.getGroup(groupId);

    // For each tag name, get the subscribers and create a set of users preceded by "@"
    // If the tag does not exist / is empty / only has the current user, add it to the corresponding array
    for(const tagName of tagNames) {

        const tag = await tagRepository.get(group.id, tagName);

        if(tag === null) {
            nonExistentTags.push(tagName);
            continue;
        }
        
        const tagSubscribers = await tagRepository.getSubscribers(group.id, tagName);


        // Check if the tag is empty
        if(tagSubscribers.length == 0) {
            emptyTags.push(tagName);
            continue;
        }

        //Remove the current user from the subscribers list
        const subscribersWithoutMe = tagSubscribers.filter(subscriber => subscriber.userId !== ctx.from.id.toString());  
        //Check if the tag has only one subscriber (the current user)
        if(subscribersWithoutMe.length == 0) {
            onlyOneInTags.push(tagName);
            continue;
        }

        //BEFORE TAGGING --> ANTI FLOOD PROCEDURE
        const userId = ctx.update.message.from.id.toString();
        const iuf = await isUserFlooding(userId, ctx.session.lastUsedTags);
        if(iuf) {
            isFlooding = true;
            break;
        }

        //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
        if(subscribersWithoutMe.length > 10) {

            const groupName = ctx.msg.chat.title;

            const message = await tagPrivately(ctx, tagName, groupName, subscribersWithoutMe, messageToReplyTo);
            await ctx.reply(message, { 
                reply_parameters: { message_id: messageToReplyTo },
                parse_mode: "HTML",
                link_preview_options: { is_disabled: true }
            });
        }
        else {
            const message = subscribersWithoutMe.map(s => `<a href="tg://user?id=${s.userId}">@${s.username}</a>`).join(" ");
            await ctx.reply(message, { reply_parameters: { message_id: messageToReplyTo }, parse_mode: "HTML" }); 
        }

        await tagRepository.updateLastTagged(group.id, tagName);        
    }

    //ERROR MESSAGES PHASE
    let errorMessages = "";
    if(emptyTags.length > 0)
        errorMessages += ctx.t("tag.validation-empty", {tagName: emptyTags.join(", "), count: emptyTags.length});
    if(nonExistentTags.length > 0)
        errorMessages += "\n" + ctx.t("tag.validation-not-found", {tagName: nonExistentTags.join(", "), count: nonExistentTags.length});
    if(onlyOneInTags.length > 0)
        errorMessages += "\n" + ctx.t("tag.validation-only-one", {tagName: onlyOneInTags.join(", "), count: onlyOneInTags.length});


    
    //This message will be deleted shortly after
    if(errorMessages.length > 0) {
        const errorMessage = await ctx.reply(errorMessages, { reply_parameters: { message_id: messageToReplyTo }, parse_mode: "HTML"});

        setTimeout(async () => {
            await ctx.api.deleteMessage(ctx.chat.id, errorMessage.message_id);
        }, 5000);
    }

    //ANTI FLOOD MESSAGE PHASE
    if(isFlooding) {
        const antiFloodMessage = await ctx.reply(ctx.t("tag.validation-flooding"), { parse_mode: "HTML", reply_parameters: { message_id: messageToReplyTo }});

        setTimeout(async () => {
            await ctx.api.deleteMessage(ctx.chat.id, antiFloodMessage.message_id);
        }, 8000);
    }
}