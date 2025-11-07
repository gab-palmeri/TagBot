import { Composer } from "grammy";
import {MyContext} from "@utils/customTypes";
import { checkIfGroup, canCreate, canUpdate } from "shared/middlewares";

import TagServices from "./tag.services";
import { msgCreateSyntaxError, msgDeleteSyntaxError, msgRenameSyntaxError, msgTagSyntaxError, msgCreateTag, msgDeleteTag, msgRenameTag } from "@messages/tagMessages";
import { isUserFlooding, tagPrivately, tagPublicly } from "shared/helperFunctions";

const TagComposer = new Composer<MyContext>();

TagComposer.command("create", checkIfGroup, canCreate, async ctx => {
    
    const issuerUsername = ctx.msg.from.username;
    const args = ctx.match.toString();

    const groupId = ctx.msg.chat.id.toString();
    const userId = ctx.msg.from.id.toString();

    const tagName = args.trim();
    if(tagName.length == 0)
        return await ctx.reply(msgCreateSyntaxError);
    
        
    const result = await TagServices.createTag(groupId, tagName, userId);

    if(result === true) {
        return await ctx.reply(msgCreateTag(tagName, issuerUsername));
    }
    else {
        return await ctx.reply(`⚠️ ${result} (@${issuerUsername})`);
    }
        
});

TagComposer.command("delete", checkIfGroup, canUpdate, async ctx => {
    const tagName = ctx.match.toString();
    const issuerUsername = ctx.msg.from.username;
    const groupId = ctx.update.message.chat.id.toString();

    if (tagName.length == 0)
        return await ctx.reply(msgDeleteSyntaxError);

    const result = await TagServices.deleteTag(groupId, tagName);

    if(result === true) {
        return await ctx.reply(msgDeleteTag(tagName, issuerUsername));
    }
    else {
        return await ctx.reply(`⚠️ ${result} (@${issuerUsername})`);
    }
        
});

TagComposer.command("rename", checkIfGroup, canUpdate, async ctx => {
    const args = ctx.match.toString();
    const [oldTagName, newTagName] = args.trim().split(/\s+/);
    const groupId = ctx.update.message.chat.id.toString();
    
    if(oldTagName.length == 0 || newTagName.length == 0)
        return await ctx.reply(msgRenameSyntaxError);

    const issuerUsername = ctx.msg.from.username;

    const regex = /^(?=[^A-Za-z]*[A-Za-z])[#]{0,1}[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;
    if(!regex.test(oldTagName) || !regex.test(newTagName)) 
        return await ctx.reply(msgTagSyntaxError(issuerUsername));


    const result = await TagServices.renameTag(groupId, oldTagName, newTagName);
        
    if(result === true) {
        const sentMessage = await ctx.reply(msgRenameTag(oldTagName,newTagName,issuerUsername) , {parse_mode: "HTML"});
        
        //NOTIFY SUBSCRIBERS OF THE TAG RENAMING
        const result = await TagServices.getTagSubscribers(newTagName, groupId);

        if(result instanceof Array) {
            //Remove the current user from the subscribers list
            const subscribersWithoutMe = result.filter(subscriber => subscriber.userId !== ctx.from.id.toString());
            if(subscribersWithoutMe.length > 0) {
                //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
                if(result.length > 10) 
                    await tagPrivately(ctx, oldTagName, subscribersWithoutMe, sentMessage.message_id);
                else 
                    await tagPublicly(ctx, groupId, subscribersWithoutMe, sentMessage.message_id);
            }
        }
    }
    else {
        return await ctx.reply(`⚠️ ${result} (@${issuerUsername})`, {parse_mode: "HTML"});
    }
});

TagComposer.on("::hashtag", checkIfGroup, async ctx => {

    if(ctx.msg.forward_origin !== undefined)
        return;

    //get ALL tag names mentioned 
    const tagNames = ctx.entities().filter(entity => entity.type == "hashtag").map(entity => entity.text);

    //print a message that says "{username} tagged this tag: {tagname}"
    //add also the date in this format: "dd/mm/yyyy hh:mm:ss"
    console.log(ctx.from.username + "used this tag(s): " + tagNames + " at " + new Date().toLocaleString("it-IT"));

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
        

        const result = await TagServices.getTagSubscribers(tagName.substring(1), groupId);

        if(result instanceof Array) {

            //Remove the current user from the subscribers list
            const subscribersWithoutMe = result.filter(subscriber => subscriber.userId !== ctx.from.id.toString());

            if(subscribersWithoutMe.length > 0) {

                //BEFORE TAGGING --> ANTI FLOOD PROCEDURE
                const userId = ctx.update.message.from.id.toString();
                const iuf = await isUserFlooding(userId, ctx.session.lastUsedTags);
                if(iuf) {
                    isFlooding = true;
                    break;
                }

                await TagServices.updateLastTagged(tagName.substring(1), groupId);

                //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
                if(result.length > 10) 
                    await tagPrivately(ctx, tagName, subscribersWithoutMe, messageToReplyTo);
                else 
                    await tagPublicly(ctx, groupId, result, messageToReplyTo); 
            
            }
            else {
                onlyOneInTags.push(tagName);
            } 
        }
        else if(result..message === "This tag doesn't exist")
            nonExistentTags.push(tagName);
        else if(result.error.message === "No one is subscribed to this tag")
            emptyTags.push(tagName);
    }


    console.log(ctx.from.username + " tagged " + tagNames + ", procedure ended at: " + new Date().toLocaleString("it-IT"));

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