import { MyContext } from "@utils/customTypes";
import TagRepository from "@db/tag/tag.repository";

import { isUserFlooding, tagPrivately } from "@utils/helperFunctions";
import { msgFloodingError, msgPublicTag, msgTagsErrors } from "@messages/subscriberMessages";

export async function hashtagHandler(ctx: MyContext) {

    const tagRepository = new TagRepository();

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

    
    // For each tag name, get the subscribers and create a set of users preceded by "@"
    // If the tag does not exist / is empty / only has the current user, add it to the corresponding array
    for(const tagName of tagNames) {

        const tag = await tagRepository.get(tagName, groupId);

        if(tag.ok === false && tag.error === "NOT_FOUND") {
            nonExistentTags.push(tagName);
            continue;
        }
        
        const tagSubResult = await tagRepository.getSubscribers(tagName.substring(1), groupId);

        if(tagSubResult.ok === true) {

            // Check if the tag is empty
            if(tagSubResult.value.length == 0) {
                emptyTags.push(tagName);
                continue;
            }

            //Remove the current user from the subscribers list
            const subscribersWithoutMe = tagSubResult.value.filter(subscriber => subscriber.userId !== ctx.from.id.toString());

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
                    reply_to_message_id: ctx.msg.message_id,
                    parse_mode: "HTML",
                    link_preview_options: { is_disabled: true }
                });
            }
            else {
                const message = await msgPublicTag(subscribersWithoutMe);
                await ctx.reply(message, { reply_to_message_id: messageToReplyTo, parse_mode: "HTML" }); 
            }

            await tagRepository.updateLastTagged(tagName.substring(1), groupId);        
        }
        else {
            console.log(`An internal error occurred while retrieving subscribers for tag ${tagName} in group ${groupId}`);
            await ctx.reply(`⚠️ An internal error occurred while retrieving subscribers for tag <b>#${tagName}</b>`, { reply_to_message_id: messageToReplyTo, parse_mode: "HTML" });
        }
    }

    //ERROR MESSAGES PHASE
    const errorMessages = msgTagsErrors(emptyTags, nonExistentTags, onlyOneInTags);
    
    //This message will be deleted shortly after
    if(errorMessages.length > 0) {
        const errorMessage = await ctx.reply(errorMessages, { reply_to_message_id: messageToReplyTo });

        setTimeout(async () => {
            await ctx.api.deleteMessage(ctx.chat.id, errorMessage.message_id);
        }, 5000);
    }

    //ANTI FLOOD MESSAGE PHASE
    if(isFlooding) {
        const antiFloodMessage = await ctx.reply(msgFloodingError, { reply_to_message_id: messageToReplyTo });

        setTimeout(async () => {
            await ctx.api.deleteMessage(ctx.chat.id, antiFloodMessage.message_id);
        }, 8000);
    }
}