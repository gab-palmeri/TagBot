import { Composer } from "grammy";
import { checkIfGroup } from "../middlewares";
import {MyContext} from "../customTypes";
import SubscriberServices from "../services/SubscriberServices";
import { isUserFlooding, join, tagPrivately, tagPublicly } from "./helperFunctions";

import { msgJoinSyntaxError, msgLeaveSyntaxError, msgLeaveTag, msgListTags, msgMyTags, msgTagsErrors, msgFloodingError } from "../messages/subscriberMessages";

const UserComposer = new Composer<MyContext>();


UserComposer.command("join", checkIfGroup, async ctx => {

    let tagName = ctx.match.toString();

    if(tagName.length == 0) 
        return await ctx.reply(msgJoinSyntaxError);
    
    //if tagName starts with #, remove it
    tagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;

    const groupId = ctx.update.message.chat.id;
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    await join(ctx, userId, groupId, username, tagName);
});

UserComposer.callbackQuery("join-tag", async (ctx) => {

	let tagName = ctx.callbackQuery.message.text.split(" ")[3].slice(0, -1);

    if(tagName.length == 0) 
        return await ctx.reply(msgJoinSyntaxError);
    
    //if tagName starts with #, remove it
    tagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;

    const groupId = ctx.callbackQuery.message.chat.id;
    const username = ctx.callbackQuery.from.username;
    const userId = ctx.callbackQuery.from.id.toString();

    await join(ctx, userId, groupId, username, tagName);
	await ctx.answerCallbackQuery();
});

UserComposer.command("leave", checkIfGroup, async ctx => {

    let tagName = ctx.match.toString();

    if(tagName.length == 0)
        return await ctx.reply(msgLeaveSyntaxError);
    
    //if tagName starts with #, remove it
    tagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;

    const groupId = ctx.update.message.chat.id;
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    const response = await SubscriberServices.leaveTag(groupId, tagName, userId);

    response.state === "ok"
    ? await ctx.reply(msgLeaveTag(username, tagName))
    : await ctx.reply("⚠️ " + response.message);
});

UserComposer.command("list", checkIfGroup, async ctx => {

    const groupId = ctx.update.message.chat.id;
    const response = await SubscriberServices.getGroupTags(groupId);

    if(response.state == "error") {
        await ctx.reply("⚠️ " + response.message);
        return;
    }

    await ctx.reply(msgListTags(response.payload), {parse_mode: "HTML"});
});

//function that returns the tags the user is subcribed in
UserComposer.command("mytags", checkIfGroup, async ctx => {
    
    const groupId = ctx.update.message.chat.id;
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    const response = await SubscriberServices.getSubscriberTags(userId, groupId);

    if(response.state == "error")
        return await ctx.reply("⚠️ " + response.message + ", @" + username);

    await ctx.reply(msgMyTags(response.payload, username), { parse_mode: "HTML" });
});

UserComposer.on("::hashtag", checkIfGroup, async ctx => {

    if(ctx.msg.forward_date !== undefined)
        return;

    //Get the text message, wheter it's a normal text or a media caption
    const messageContent = ctx.msg.text || ctx.msg.caption;
	const entities = ctx.msg.entities || ctx.msg.caption_entities;

    //get ALL tag names mentioned in the using the indexes contained in ctx.msg.entities
    const tagNames = entities
        .filter(entity => entity.type == 'hashtag')
        .map(entity => messageContent.substring(entity.offset, entity.offset + entity.length));

     //print a message that says "{username} tagged this tag: {tagname}"
     console.log(ctx.from.username + "used this tag(s): " + tagNames);

    const messageToReplyTo = ctx.msg.message_id;
    const groupId = ctx.update.message.chat.id;

    const emptyTags = [];
    const nonExistentTags = [];
    const onlyOneInTags = [];
    let isFlooding = false;

    //for every tag name, get the subcribers and create a set of users preceded by "@"
    //if the tag does not exist / is empty / only has the current user, add it to the corresponding array
    for(const tagName of tagNames) {
        

        const response = await SubscriberServices.getSubscribers(tagName.substring(1), groupId);

        if(response.state === "ok") {

            //Remove the current user from the subscribers list
            const subscribersWithoutMe = response.payload.filter(subscriber => subscriber !== ctx.from.id.toString());

            if(subscribersWithoutMe.length > 0) {

                //BEFORE TAGGING --> ANTI FLOOD PROCEDURE
                const userId = ctx.update.message.from.id.toString();
                const iuf = await isUserFlooding(userId, ctx.session.lastUsedTags);
                if(iuf) {
                    isFlooding = true;
                    break;
                }

                //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
                if(response.payload.length > 10) 
                    await tagPrivately(ctx, tagName, subscribersWithoutMe, messageToReplyTo);
                else 
                    await tagPublicly(ctx, groupId, response.payload, messageToReplyTo);  
            }
            else {
                onlyOneInTags.push(tagName);
            } 
        }
        else if(response.state === "NOT_EXISTS")
            nonExistentTags.push(tagName);
        else if(response.state === "TAG_EMPTY")
            emptyTags.push(tagName);
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


export default UserComposer;