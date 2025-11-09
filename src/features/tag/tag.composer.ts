import { Composer, InlineKeyboard } from "grammy";
import {MyContext} from "@utils/customTypes";
import { checkIfGroup, canCreate, canUpdate } from "shared/middlewares";

import TagServices from "./tag.services";
import { msgCreateSyntaxError, msgDeleteSyntaxError, msgRenameSyntaxError, msgTagSyntaxError, msgCreateTag, msgDeleteTag, msgRenameTag } from "@messages/tagMessages";
import { isUserFlooding, tagPrivately, tagPublicly } from "shared/helperFunctions";

import { msgListTags, msgTagsErrors, msgFloodingError } from "@messages/subscriberMessages";
import TagRepository from "./tag.repository";


const TagComposer = new Composer<MyContext>();
const tagService = new TagServices(new TagRepository());

TagComposer.command("create", checkIfGroup, canCreate, async ctx => {
    
    const issuerUsername = ctx.msg.from.username;
    const args = ctx.match.toString();

    const groupId = ctx.msg.chat.id.toString();
    const userId = ctx.msg.from.id.toString();

    const tagName = args.trim();
    if(tagName.length == 0)
        return await ctx.reply(msgCreateSyntaxError);
    
        
    const result = await tagService.createTag(groupId, tagName, userId);

    if(result.ok === true) {
        return await ctx.reply(msgCreateTag(tagName, issuerUsername));
    }
    else {
        switch(result.error) {
            case "INVALID_SYNTAX":
                return await ctx.reply(msgTagSyntaxError(issuerUsername));
            case "ALREADY_EXISTS":
                return await ctx.reply(`⚠️ Tag <b>#${tagName}</b> already exists (@${issuerUsername})`, {parse_mode: "HTML"});
            case "INTERNAL_ERROR":
                return await ctx.reply(`⚠️ An internal error occurred while creating the tag (@${issuerUsername})`, {parse_mode: "HTML"});
        }
    }
        
});

TagComposer.command("delete", checkIfGroup, canUpdate, async ctx => {
    const tagName = ctx.match.toString();
    const issuerUsername = ctx.msg.from.username;
    const groupId = ctx.update.message.chat.id.toString();

    if (tagName.length == 0)
        return await ctx.reply(msgDeleteSyntaxError);

    const result = await tagService.deleteTag(groupId, tagName);

    if(result.ok === true) {
        return await ctx.reply(msgDeleteTag(tagName, issuerUsername));
    }
    else {
        switch(result.error) {
            case "NOT_FOUND":
                return await ctx.reply(`⚠️ Tag <b>#${tagName}</b> not found (@${issuerUsername})`, {parse_mode: "HTML"});
            case "INTERNAL_ERROR":
                return await ctx.reply(`⚠️ An internal error occurred while deleting the tag (@${issuerUsername})`, {parse_mode: "HTML"});
        }
    }
        
});

TagComposer.command("rename", checkIfGroup, canUpdate, async ctx => {
    const args = ctx.match.toString();
    const [oldTagName, newTagName] = args.trim().split(/\s+/);
    const groupId = ctx.update.message.chat.id.toString();
    
    if(oldTagName.length == 0 || newTagName.length == 0)
        return await ctx.reply(msgRenameSyntaxError);

    const issuerUsername = ctx.msg.from.username;

    const result = await tagService.renameTag(groupId, oldTagName, newTagName);
        
    if(result.ok === true) {
        const sentMessage = await ctx.reply(msgRenameTag(oldTagName,newTagName,issuerUsername) , {parse_mode: "HTML"});
        
        //NOTIFY SUBSCRIBERS OF THE TAG RENAMING
        const result = await tagService.getTagSubscribers(newTagName, groupId);

        if(result instanceof Array) {
            //Remove the current user from the subscribers list
            const subscribersWithoutMe = result.filter(subscriber => subscriber.userId !== ctx.from.id.toString());
            if(subscribersWithoutMe.length > 0) {
                //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
                if(result.length > 10) {
                    const groupName = ctx.msg.chat.title;
                    const message = await tagPrivately(ctx, newTagName, groupName, subscribersWithoutMe, sentMessage.message_id);
                    await ctx.reply(message, { 
                        reply_to_message_id: sentMessage.message_id,
                        parse_mode: "HTML",
                        link_preview_options: { is_disabled: true }
                    });
                }
                else {
                    const message = await tagPublicly(subscribersWithoutMe);
                    await ctx.reply(message, { reply_to_message_id: sentMessage.message_id, parse_mode: "HTML" });
                }
            }
        }
    }
    else {
        switch(result.error) {
            case "INVALID_SYNTAX":
                return await ctx.reply(msgTagSyntaxError(issuerUsername));
            case "NOT_FOUND":
                return await ctx.reply(`⚠️ Tag <b>#${oldTagName}</b> not found (@${issuerUsername})`, {parse_mode: "HTML"});
            case "ALREADY_EXISTS":
                return await ctx.reply(`⚠️ Tag <b>#${newTagName}</b> already exists (@${issuerUsername})`, {parse_mode: "HTML"});
            case "INTERNAL_ERROR":
                return await ctx.reply(`⚠️ An internal error occurred while renaming the tag (@${issuerUsername})`, {parse_mode: "HTML"});
        }
    }
});

TagComposer.command("list", checkIfGroup, async ctx => {

    const groupId = ctx.update.message.chat.id.toString();
    const tagsByGroupResponse = await tagService.getTagsByGroup(groupId);

    if(tagsByGroupResponse.ok === true) {
        const mostActiveTags = tagsByGroupResponse.value.mainTags;
        const nextTags = tagsByGroupResponse.value.secondaryTags;
        
        // Create the message to send
        const message = msgListTags(mostActiveTags, nextTags);
        const inlineKeyboard = new InlineKeyboard().text("See all tags", `show-all-tags`);
        await ctx.reply(message, { reply_markup: inlineKeyboard, parse_mode: "HTML" });
    }
    else {
        switch(tagsByGroupResponse.error) {
            case "NOT_FOUND":
                return await ctx.reply("⚠️ No tags found in this group.");
            case "INTERNAL_ERROR":
                return await ctx.reply("⚠️ An internal error occurred while retrieving the tags.");
        }
    }
});


TagComposer.on("::hashtag", checkIfGroup, async ctx => {

    if(ctx.msg.forward_origin !== undefined)
        return;

    //get ALL tag names mentioned 
    const tagNames = ctx.entities().filter(entity => entity.type == "hashtag").map(entity => entity.text);
    const messageToReplyTo = ctx.msg.message_id;
    const groupId = ctx.update.message.chat.id.toString();

    const emptyTags = [];
    const nonExistentTags = [];
    const onlyOneInTags = [];
    let isFlooding = false;

    await ctx.react("👀");
    
    //for every tag name, get the subcribers and create a set of users preceded by "@"
    //if the tag does not exist / is empty / only has the current user, add it to the corresponding array
    for(const tagName of tagNames) {
        
        const tagSubResult = await tagService.getTagSubscribers(tagName.substring(1), groupId);

        if(tagSubResult.ok === true) {

            //Remove the current user from the subscribers list
            const subscribersWithoutMe = tagSubResult.value.filter(subscriber => subscriber.userId !== ctx.from.id.toString());

            if(subscribersWithoutMe.length > 0) {

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
                    const message = await tagPublicly(subscribersWithoutMe);
                    await ctx.reply(message, { reply_to_message_id: messageToReplyTo, parse_mode: "HTML" }); 
                }


                await tagService.updateLastTagged(tagName.substring(1), groupId);
            
            }
            else {
                onlyOneInTags.push(tagName);
            } 
        }
        else {
            switch(tagSubResult.error) {
                case "NOT_FOUND":
                    nonExistentTags.push(tagName);
                    break;
                case "NO_CONTENT":
                    emptyTags.push(tagName);
                    break;
                case "INTERNAL_ERROR":
                    console.log(`An internal error occurred while retrieving subscribers for tag ${tagName} in group ${groupId}`);
                    break;
            }
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
        
});

export default TagComposer;