import { Composer } from "grammy";
import { checkIfGroup } from "../middlewares";
import { MyContext } from "../customTypes";

import SubscriberServices from "../services/SubscriberServices";
import TagServices from "../services/TagServices";

import { isUserFlooding, join, tagPrivately, tagPublicly } from "./helperFunctions";
import { msgJoinSyntaxError, msgLeaveSyntaxError, msgLeaveTag, msgListTags, msgMyTags, msgTagsErrors, msgFloodingError } from "../messages/subscriberMessages";

const SubscriberComposer = new Composer<MyContext>();


SubscriberComposer.command("join", checkIfGroup, async ctx => {

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

SubscriberComposer.callbackQuery("join-tag", async (ctx) => {

    if(ctx.callbackQuery.message.chat.type !== "private") {
        //debug console log mentioning the user, the group and the tag
        console.log(ctx.callbackQuery.from.username + " joined " + ctx.callbackQuery.message.chat.title + " " + ctx.callbackQuery.message.text);

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
    }
    
});

SubscriberComposer.command("leave", checkIfGroup, async ctx => {

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

SubscriberComposer.command("list", checkIfGroup, async ctx => {

    const groupId = ctx.update.message.chat.id;
    const response = await TagServices.getGroupTags(groupId);

    if(response.state == "error") {
        await ctx.reply("⚠️ " + response.message);
        return;
    }

    /*
    To facilitate the user, if there's more than 5 tags they are sorted by a score that takes into account the number 
    of subscribers and the last time the tag was used. When building the output message they will be also sorted 
    alphabetically
    */

    const tags = response.payload;
    let message = "";

    if(tags.length > 5) {
        //Calculate the maximum number of subscribers among all the tags
        const maxSubscribers = tags.reduce((max, tag) => tag.subscribersTags.length > max ? tag.subscribersTags.length : max, 0);

        const tagsWithScores = tags.map(tag => {
            
            //Score based on the number of subscribers: the more subscribers, the higher the score
            const subscribersScore = tag.subscribersTags.length / maxSubscribers;
            
            //Score based on the last time the tag was used: the more recent, the higher the score
            const tagLastTagged = new Date(tag.lastTagged);

            //calculate the distance between today and tagLastTagged in days
            const diffTime = Math.abs(new Date().getTime() - tagLastTagged.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dateScore = 1 / diffDays;

            return { tag, score: subscribersScore + dateScore };
        });

        const tagsByScore = tagsWithScores.sort((a,b) => b.score - a.score).map(tag => tag.tag);

        const mostActiveTags = tagsByScore.slice(0, 5).sort((a,b) => a.name.localeCompare(b.name));
        const otherTags = tagsByScore.slice(mostActiveTags.length).sort((a,b) => a.name.localeCompare(b.name));

        message = msgListTags(mostActiveTags, otherTags);
    }
    else {
        const tagsByName = tags.sort((a,b) => a.name.localeCompare(b.name));

        message = msgListTags(tagsByName);
    }

    await ctx.reply(message, {parse_mode: "HTML"});
});

//function that returns the tags the user is subcribed in
SubscriberComposer.command("mytags", checkIfGroup, async ctx => {
    
    const groupId = ctx.update.message.chat.id;
    const username = ctx.update.message.from.username;
    const userId = ctx.update.message.from.id.toString();

    const response = await SubscriberServices.getSubscriberTags(userId, groupId);

    if(response.state == "error")
        return await ctx.reply("⚠️ " + response.message + ", @" + username);

    const tags = response.payload.sort((a,b) => a.name.localeCompare(b.name));

    await ctx.reply(msgMyTags(tags, username), { parse_mode: "HTML" });
});

SubscriberComposer.on("::hashtag", checkIfGroup, async ctx => {

    if(ctx.msg.forward_date !== undefined)
        return;

    //get ALL tag names mentioned 
    const tagNames = ctx.entities().filter(entity => entity.type == "hashtag").map(entity => entity.text);

     //print a message that says "{username} tagged this tag: {tagname}"
     //add also the date in this format: "dd/mm/yyyy hh:mm:ss"
     console.log(ctx.from.username + "used this tag(s): " + tagNames + " at " + new Date().toLocaleString("it-IT"));

    const messageToReplyTo = ctx.msg.message_id;
    const groupId = ctx.update.message.chat.id;

    const emptyTags = [];
    const nonExistentTags = [];
    const onlyOneInTags = [];
    let isFlooding = false;

    //temp msg to signal the user that the bot is tagging
    let loadingMsgId = (await ctx.reply("⏳ Tagging in progress...")).message_id;

    //for every tag name, get the subcribers and create a set of users preceded by "@"
    //if the tag does not exist / is empty / only has the current user, add it to the corresponding array
    for(const tagName of tagNames) {
        

        const response = await TagServices.getTagSubscribers(tagName.substring(1), groupId);

        if(response.state === "ok") {

            //Remove the current user from the subscribers list
            const subscribersWithoutMe = response.payload.filter(subscriber => subscriber.userId !== ctx.from.id.toString());

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
                if(response.payload.length > 10) 
                    await tagPrivately(ctx, tagName, subscribersWithoutMe, messageToReplyTo, loadingMsgId);
                else 
                    await tagPublicly(ctx, groupId, response.payload, messageToReplyTo, loadingMsgId); 
            
                loadingMsgId = null;
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

    //If loadingMsgId is not null, because there were no valid tags, delete the msg
    if(loadingMsgId !== null) {
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsgId);
        loadingMsgId = null;
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

    const subscriber = await SubscriberServices.getSubscriber(ctx.from.id.toString());

    if(subscriber.state === "ok") {
        //Check that the subscriber.username is equal to the ctx.from.username
        if(subscriber.payload.username !== ctx.from.username) {
            //If not, update the subscriber
            await SubscriberServices.updateSubscriberUsername(ctx.from.id.toString(), ctx.from.username);
        }
    }
});


export default SubscriberComposer;