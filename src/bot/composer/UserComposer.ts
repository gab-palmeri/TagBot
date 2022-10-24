import { Composer, InlineKeyboard } from "grammy";
import { checkIfGroup } from "../middlewares";
import MyContext from "../MyContext";
import { getGroupTags, getSubscribers, getSubscriberTags, getTag, joinTag, leaveTag, updateTagDate } from "../services/userServices";

const UserComposer = new Composer<MyContext>();


UserComposer.command("join", checkIfGroup, async ctx => {

    const tagName = ctx.match.toString();

    if(tagName.length == 0) 
        return await ctx.reply("⚠️ Syntax: /join tagname");

    const groupId = ctx.update.message.chat.id;
    const username = ctx.update.message.from.username;

    const response = await joinTag(groupId, tagName, username);
    const message = response.state === "ok" ? 
    '@' + username + ' joined tag ' + tagName + '. They will be notified when someone tags it.' : 
    "⚠️ " + response.message + ', @' + username;

	const inlineKeyboard = new InlineKeyboard().text("Join this tag", "join-tag");

	response.state === "ok" ?
	await ctx.reply(message, { reply_markup: inlineKeyboard }) :
	await ctx.reply(message);
});

UserComposer.callbackQuery("join-tag", async (ctx) => {

	const tagName = ctx.callbackQuery.message.text.split(" ")[3].slice(0, -1);

    if(tagName.length == 0) 
        return await ctx.reply("⚠️ Syntax: /join tagname");

    const groupId = ctx.callbackQuery.message.chat.id;
    const username = ctx.callbackQuery.from.username;

    const response = await joinTag(groupId, tagName, username);
    const message = response.state === "ok" ? 
    '@' + username + ' joined tag ' + tagName + '. They will be notified when someone tags it.' : 
    "⚠️ " + response.message + ', @' + username;

    await ctx.reply(message);
	await ctx.answerCallbackQuery();
});

UserComposer.command("leave", checkIfGroup, async ctx => {

    const tagName = ctx.match.toString();

    if(tagName.length == 0)
        return await ctx.reply('⚠️ Syntax: /leave tagname');

    const groupId = ctx.update.message.chat.id;
    const username = ctx.update.message.from.username;

    const response = await leaveTag(groupId, tagName, username);
    const message = response.state === "ok" ? 
    '@' + username + ' left tag ' + tagName + '. They will no longer be notified when someone tags it.' : 
    "⚠️ " + response.message;

    await ctx.reply(message);
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
    const onCooldown = [];

    //for every tag name, get the subcribers and create a set of users preceded by "@"
    //if the tag does not exist / is empty / is on cooldown, add it to the corresponding array
    for(const tagName of tagNames) {
        const response = await getSubscribers(tagName.substring(1), groupId);

        if(response.state === "ok") {
            const tagResponse = await getTag(groupId, tagName.substring(1));
            
            //if the lastTagged date is not null AND it's less than 10 seconds ago, add it to the onCooldown array
            if(tagResponse.payload.lastTagged !== null && (Date.now() - tagResponse.payload.lastTagged.getTime()) < 10000)
                onCooldown.push(tagName);
            else {
                await updateTagDate(groupId, tagName.substring(1));
                const message = Array.from(response.payload.map(subscriber => "@" + subscriber)).join(" ") + "\n";
                await ctx.reply(message, { reply_to_message_id: messageToReplyTo });
            }
        }
        else if(response.state === "NOT_EXISTS")
            nonExistentTags.push(tagName);
        else if(response.state === "TAG_EMPTY")
            emptyTags.push(tagName);
    }

    let errorMessages = "";

    onCooldown.length == 1 ? 
    errorMessages += "🕑 Tag " + onCooldown[0] + " is on cooldown. Please wait a few seconds before tagging it again.\n" :
    onCooldown.length > 1 ?
    errorMessages += "🕑 Tags " + onCooldown.join(", ") + " are on cooldown. Please wait a few seconds before tagging them again.\n" : null;

    emptyTags.length == 1 ?
    errorMessages += "⚠️ The tag " + emptyTags[0] + " is empty\n" :
    emptyTags.length > 1 ?
    errorMessages += "⚠️ These tags are empty: " + emptyTags.join(", ") + "\n" : null;

    nonExistentTags.length == 1 ? 
    errorMessages += "❌ The tag " + nonExistentTags[0] + " does not exist\n" : 
    nonExistentTags.length > 1 ?
    errorMessages += "❌ These tags do not exist: " + nonExistentTags.join(", ") : null;
    
    if(errorMessages.length > 0)
        await ctx.reply(errorMessages, { reply_to_message_id: messageToReplyTo });
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

    const response = await getSubscriberTags(username, groupId);

    if(response.state == "error")
        return await ctx.reply("⚠️ " + response.message + ", @" + username);

    const message = "📄 <b>Here's a list of the tags you're in, @" + username + ":</b>\n\n" + 
    response.payload.map((tag) => "- " + tag.name).join("\n");

    await ctx.reply(message, { parse_mode: "HTML" });
});

export default UserComposer;