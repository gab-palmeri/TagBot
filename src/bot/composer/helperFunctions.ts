import { InlineKeyboard } from "grammy";
import MyContext from "../MyContext";
import SubscriberServices from "../services/SubscriberServices";
import UserServices from "../services/UserServices";

import { msgJoinPublic, msgJoinStartBot, msgPrivateTag, msgPrivateTagError, msgPrivateTagResponse } from "../messages/subscriberMessages";

export async function join(ctx: MyContext, userId: string, groupId: number, username: string, tagName: string) {
    if(await UserServices.userExists(userId)) {

        const response = await SubscriberServices.joinTag(groupId, tagName, userId);

        if(response.state === "ok") {
            const [msg, inlineKeyboardText] = msgJoinPublic(tagName, username);
            const inlineKeyboard = new InlineKeyboard().text(inlineKeyboardText, "join-tag");

            await ctx.reply(msg, { reply_markup: inlineKeyboard });
        }
        else {
            const message = "⚠️ " + response.message + ', @' + username;
            await ctx.reply(message);
        }
    }
    else {
        const [msg, inlineKeyboardText] = msgJoinStartBot(tagName, username);
        const inlineKeyboard = new InlineKeyboard().url(inlineKeyboardText, "https://t.me/" + ctx.me.username + "?start=" + userId + "_" + groupId + "_" + tagName);
        await ctx.reply(msg, { reply_markup: inlineKeyboard, parse_mode: "HTML" });
    }
}


//This function tags the users directly in the group
export async function tagPublicly(ctx: MyContext, groupId: number, subscribers: string[], messageToReplyTo: number) {

    const usernames = await Promise.all(subscribers.map(async (subscriber: string) => {
        const user = await ctx.api.getChatMember(groupId, parseInt(subscriber));
        return '@' + user.user.username;
    }));

    const message = usernames.join(" ") + "\n";
    await ctx.reply(message, { reply_to_message_id: messageToReplyTo });

    
}

//This function sends a private message to each user subscribed to the tag
export async function tagPrivately(ctx: MyContext, tagName: string, subscribers: string[], messageToReplyTo: number) {
    const messageLink = "https://t.me/c/" + ctx.msg.chat.id.toString().slice(4) + "/" + messageToReplyTo;
    const notContacted = [];

    //get the group name
    const group = await ctx.api.getChat(ctx.msg.chat.id);
    const toSendMessage = msgPrivateTag(tagName, group["title"], messageLink);
    for(const subscriber of subscribers) {
        try {
            await ctx.api.sendMessage(subscriber, toSendMessage, { parse_mode: "HTML" });
        } catch(error) {
            notContacted.push((await ctx.getChatMember(parseInt(subscriber))).user.first_name);
        }
    }

    let message = "";

    //if at least one user was privately tagged successfully..
    if(subscribers.length > notContacted.length)
        message += msgPrivateTagResponse(tagName);

    //If the bot was not able to contact at least one user..
    if(notContacted.length > 0) 
        message += msgPrivateTagError(notContacted.join(", "));


    const sentMessage = await ctx.reply(message, { 
        reply_to_message_id: ctx.msg.message_id,
        parse_mode: "HTML",
        disable_web_page_preview: true
    });

    setTimeout(() => {
        void ctx.api.deleteMessage(ctx.chat.id, sentMessage.message_id);
    }, 5000);
}

export async function isUserFlooding(userId: string, lastUsedTags: {userId:string,timestamps: number[]}[]) {
    
    const now = new Date().getTime();

    //ctx.session.lastUsedTags entries contain: userId, list of last three timestamps
    const userTimestamps = lastUsedTags.find(usedTag => usedTag.userId == userId);

    //If the user has never used a tag, add an entry to the array
    if(userTimestamps === undefined) {
        lastUsedTags.push({ userId, timestamps: [now] });
        return false;
    }
    else {

        //Else, if the user has used less than three tags, just push the current timestamp
        if(userTimestamps.timestamps.length < 3) {
            userTimestamps.timestamps.push(now);
            return false;
        }
        else {
            //Else, find the first timestamp before 5 minutes ago and get its index
            const timestampIndex = userTimestamps.timestamps.findIndex(timestamp => timestamp < now - 300000);

            //If there isn't one, return an error message; else swap the timestamp with the current one
            if(timestampIndex === -1) {
                return true;
            }
            else {
                userTimestamps.timestamps[timestampIndex] = now;
                return false;
            }
        }
    }
}
