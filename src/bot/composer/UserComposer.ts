import { Composer } from "grammy";
import { checkIfGroup } from "../middlewares";
import MyContext from "../MyContext";
import { getGroupTags, getSubscribers, getSubscriberTags, leaveTag } from "../services/subscriberServices";
import { join, tagPrivately, tagPublicly } from "./helperFunctions";


const UserComposer = new Composer<MyContext>();


UserComposer.command("join", checkIfGroup, async ctx => {

    const tagName = ctx.match.toString();

    if(tagName.length == 0) 
        return await ctx.reply("⚠️ Syntax: /join tagname");

    const groupId = ctx.update.message.chat.id;
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    await join(ctx, userId, groupId, username, tagName);
});

UserComposer.callbackQuery("join-tag", async (ctx) => {

	const tagName = ctx.callbackQuery.message.text.split(" ")[3].slice(0, -1);

    if(tagName.length == 0) 
        return await ctx.reply("⚠️ Syntax: /join tagname");

    const groupId = ctx.callbackQuery.message.chat.id;
    const username = ctx.callbackQuery.from.username;
    const userId = ctx.callbackQuery.from.id.toString();

    await join(ctx, userId, groupId, username, tagName);
	await ctx.answerCallbackQuery();
});

UserComposer.command("leave", checkIfGroup, async ctx => {

    const tagName = ctx.match.toString();

    if(tagName.length == 0)
        return await ctx.reply('⚠️ Syntax: /leave tagname');

    const groupId = ctx.update.message.chat.id;
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    const response = await leaveTag(groupId, tagName, userId);
    const message = response.state === "ok" ? 
    '@' + username + ' left tag ' + tagName + '. They will no longer be notified when someone tags it.' : 
    "⚠️ " + response.message;

    await ctx.reply(message);
});

UserComposer.command("list", checkIfGroup, async ctx => {

    const groupId = ctx.update.message.chat.id;
    const response = await getGroupTags(groupId);

    if(response.state == "error") {
        await ctx.reply("⚠️ " + response.message);
        return;
    }

    //create a fancy message with the tags list
    const message = "📄 <b>Here's a list of all the tags in this group:</b>\n\n" + response.payload.map((tag) => {
        if(tag.subscribers.length == 1)
            return "- " + tag.name + " <i>(1/50 sub)</i>";
        else
            return "- " + tag.name + " <i>(" + tag.subscribers.length + "/50 subs)</i>";
    }).join("\n");

    await ctx.reply(message, {parse_mode: "HTML"});
});

//function that returns the tags the user is subcribed in
UserComposer.command("mytags", checkIfGroup, async ctx => {
    
    const groupId = ctx.update.message.chat.id;
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    const response = await getSubscriberTags(userId, groupId);

    if(response.state == "error")
        return await ctx.reply("⚠️ " + response.message + ", @" + username);

    const message = "📄 <b>Here's a list of the tags you're in, @" + username + ":</b>\n\n" + 
    response.payload.map((tag) => "- " + tag.name).join("\n");

    await ctx.reply(message, { parse_mode: "HTML" });
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

    const messageToReplyTo = ctx.update.message.reply_to_message ? ctx.update.message.reply_to_message.message_id : ctx.msg.message_id;
    const groupId = ctx.update.message.chat.id;

    const emptyTags = [];
    const nonExistentTags = [];

    //for every tag name, get the subcribers and create a set of users preceded by "@"
    //if the tag does not exist / is empty, add it to the corresponding array
    for(const tagName of tagNames) {
        const response = await getSubscribers(tagName.substring(1), groupId);

        if(response.state === "ok") {
            //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
            if(response.payload.length > 10) 
                await tagPrivately(ctx, tagName, response.payload, messageToReplyTo);
            else 
                await tagPublicly(ctx, groupId, response.payload, messageToReplyTo);       
        }
        else if(response.state === "NOT_EXISTS")
            nonExistentTags.push(tagName);
        else if(response.state === "TAG_EMPTY")
            emptyTags.push(tagName);
    }

    //ERROR MESSAGES PHASE
    let errorMessages = "";

    emptyTags.length == 1 ?
    errorMessages += "⚠️ The tag " + emptyTags[0] + " is empty\n" :
    emptyTags.length > 1 ?
    errorMessages += "⚠️ These tags are empty: " + emptyTags.join(", ") + "\n" : null;

    nonExistentTags.length == 1 ? 
    errorMessages += "❌ The tag " + nonExistentTags[0] + " does not exist\n" : 
    nonExistentTags.length > 1 ?
    errorMessages += "❌ These tags do not exist: " + nonExistentTags.join(", ") : null;
    
    //This message will be deleted shortly after
    if(errorMessages.length > 0) {
        const errorMessage = await ctx.reply(errorMessages, { reply_to_message_id: messageToReplyTo });

        setTimeout(async () => {
            await ctx.api.deleteMessage(ctx.chat.id, errorMessage.message_id);
        }, 3000);
    }
        
});


export default UserComposer;