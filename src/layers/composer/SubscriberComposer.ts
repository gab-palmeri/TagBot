import { Composer, InlineKeyboard } from "grammy";
import { checkIfGroup } from "@utils/middlewares";
import { MyContext } from "@utils/customTypes";

import SubscriberServices from "@service/SubscriberServices";
import TagServices from "@service/TagServices";

import { isUserFlooding, join, tagPrivately, tagPublicly } from "@composer/helperFunctions";
import { msgJoinSyntaxError, msgLeaveSyntaxError, msgLeaveTag, msgListTags, msgMyTags, msgTagsErrors, msgFloodingError } from "@messages/subscriberMessages";

const SubscriberComposer = new Composer<MyContext>();


SubscriberComposer.command("join", checkIfGroup, async ctx => {

    let tagName = ctx.match.toString();

    if(tagName.length == 0) 
        return await ctx.reply(msgJoinSyntaxError);
    
    //if tagName starts with #, remove it
    tagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;

    const groupId = ctx.update.message.chat.id.toString();
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    // Ora chiamiamo join e otteniamo i messaggi da inviare
    const { msg, inlineKeyboard } = await join(ctx.me.username, userId, groupId, username, tagName);

    if (inlineKeyboard) {
        await ctx.reply(msg, { reply_markup: inlineKeyboard });
    } else {
        await ctx.reply(msg);
    }
});

SubscriberComposer.callbackQuery(/^join-tag_/, async (ctx) => {

    if(ctx.callbackQuery.message.chat.type !== "private") {
        //debug console log mentioning the user, the group and the tag
        console.log(ctx.callbackQuery.from.username + " joined " + ctx.callbackQuery.message.chat.title + " " + ctx.callbackQuery.message.text);

        let tagName = ctx.callbackQuery.data.split("_")[1];

        if(tagName.length == 0) 
            return await ctx.reply(msgJoinSyntaxError);
        
        //if tagName starts with #, remove it
        tagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;

        const groupId = ctx.callbackQuery.message.chat.id.toString();
        const username = ctx.callbackQuery.from.username;
        const userId = ctx.callbackQuery.from.id.toString();

        // Chiamiamo join per ottenere i dati da inviare
        const { msg, inlineKeyboard } = await join(ctx.me.username, userId, groupId, username, tagName);

        if (inlineKeyboard) {
    
            if (ctx.callbackQuery.message.text.includes(username)) {
                return;
            }
            
            //Add the user to the callback query original message to signal that he joined the tag
            const updatedMessage = ctx.callbackQuery.message.text
                .replace(" and", ",")
                .replace(` joined tag ${tagName}`, ` and @${username} joined tag ${tagName}`);

            await ctx.editMessageText(updatedMessage, { reply_markup: inlineKeyboard });
        } else {
            await ctx.reply(msg);
        }

        await ctx.answerCallbackQuery("Done!");
    }
    
});

SubscriberComposer.command("leave", checkIfGroup, async ctx => {

    let tagName = ctx.match.toString();

    if(tagName.length == 0)
        return await ctx.reply(msgLeaveSyntaxError);
    
    //if tagName starts with #, remove it
    tagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;

    const groupId = ctx.update.message.chat.id.toString();
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    const result = await SubscriberServices.leaveTag(groupId, tagName, userId);

    result.isSuccess()
    ? await ctx.reply(msgLeaveTag(username, tagName))
    : await ctx.reply("⚠️ " + result.error.message);
});

SubscriberComposer.command("list", checkIfGroup, async ctx => {

    const groupId = ctx.update.message.chat.id.toString();
    const result = await TagServices.getTagsByGroup(groupId);

    if(result.isFailure()) {
        await ctx.reply("⚠️ " + result.error.message);
        return;
    }

    /*
    To facilitate the user, if there's more than 5 tags they are sorted by a score that takes into account the number 
    of subscribers and the last time the tag was used. When building the output message they will be also sorted 
    alphabetically
    */

    const tags = result.value;
    let message = "";
    const maxActiveTags = 5; 
    const maxNextTags = 5; 

    // If there are more than 5 tags, sort them by score
    if(tags.length > maxActiveTags) {
        //Calculate the maximum number of subscribers among all the tags
        const maxSubscribers = tags.reduce((max, tag) => tag.subscribersNum > max ? tag.subscribersNum : max, 0);

        //Calculate the score for each tag
        const tagsWithScores = tags.map(tag => {
            //1) Score based on the number of subscribers: the more subscribers, the higher the score
            const subscribersScore = tag.subscribersNum / maxSubscribers;

            //2) Score based on the last time the tag was used: the more recent, the higher the score
            //   Calculate the distance between today and tagLastTagged in days    
            const tagLastTagged = new Date(tag.lastTagged);
            const diffTime = Math.abs(new Date().getTime() - tagLastTagged.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dateScore = 1 / diffDays;

            return { tag, score: subscribersScore + dateScore };
        });

        // Sort the tags by score
        const tagsByScore = tagsWithScores.sort((a,b) => b.score - a.score).map(tag => tag.tag);

        // Take the first 5 tags with the highest score, and then all the others
        const mostActiveTags = tagsByScore.slice(0, maxActiveTags).sort((a,b) => a.name.localeCompare(b.name));
        const nextTags = tagsByScore.slice(maxActiveTags).sort((a,b) => a.name.localeCompare(b.name));

        // Create the message to send
        message = msgListTags(mostActiveTags, nextTags.slice(0, maxNextTags));

        // "See all tags" button
        let inlineKeyboard: InlineKeyboard;
        if(nextTags.length > maxNextTags) {

            //const serializedTags = JSON.stringify({ mostActiveTags, nextTags });
            inlineKeyboard = new InlineKeyboard().text("See all tags", `show-all-tags`);
        }

        await ctx.reply(message, { reply_markup: inlineKeyboard, parse_mode: "HTML" });

    }
    else {
        // If there are less than 5 tags, sort them alphabetically and send them
        const tagsByName = tags.sort((a,b) => a.name.localeCompare(b.name));
        message = msgListTags(tagsByName);

        await ctx.reply(message, {parse_mode: "HTML"});
    }
});

SubscriberComposer.callbackQuery("show-all-tags", async (ctx) => {

    const userId = ctx.update.callback_query.from.id.toString();
    
    // Ottieni tutti i tag del gruppo
    const fullMessage = ctx.update.callback_query.data.split("_")[1];

    // Invia il messaggio in privato
    await ctx.api.sendMessage(userId, fullMessage, { parse_mode: "HTML" });
    await ctx.answerCallbackQuery("Full tags list sent in private!");
  
});

//function that returns the tags the user is subcribed in
SubscriberComposer.command("mytags", checkIfGroup, async ctx => {
    
    const groupId = ctx.update.message.chat.id.toString();
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    const result = await SubscriberServices.getSubscriberTags(userId, groupId);

    if(result.isFailure())
        return await ctx.reply("⚠️ " + result.error.message + ", @" + username);

    const tags = result.value.sort((a,b) => a.name.localeCompare(b.name));

    await ctx.reply(msgMyTags(tags, username), { parse_mode: "HTML" });
});

SubscriberComposer.on("::hashtag", checkIfGroup, async ctx => {

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

        if(result.isSuccess()) {

            //Remove the current user from the subscribers list
            const subscribersWithoutMe = result.value.filter(subscriber => subscriber.userId !== ctx.from.id.toString());

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
                if(result.value.length > 10) 
                    await tagPrivately(ctx, tagName, subscribersWithoutMe, messageToReplyTo);
                else 
                    await tagPublicly(ctx, groupId, result.value, messageToReplyTo); 
            
            }
            else {
                onlyOneInTags.push(tagName);
            } 
        }
        else if(result.error.message === "This tag doesn't exist")
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


SubscriberComposer.on("message", checkIfGroup, async ctx => {

    const result = await SubscriberServices.getSubscriber(ctx.from.id.toString());

    if(result.isSuccess()) {
        //Check that the subscriber.username is equal to the ctx.from.username
        if(result.value.username !== ctx.from.username) {
            //If not, update the subscriber
            await SubscriberServices.updateSubscriberUsername(ctx.from.id.toString(), ctx.from.username);
        }
    }
});


export default SubscriberComposer;