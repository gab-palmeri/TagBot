import { InlineKeyboard } from "grammy";
import MyContext from "../MyContext";
import { joinTag } from "../services/subscriberServices";
import { userExists } from "../services/userServices";

export async function join(ctx: MyContext, userId: string, groupId: number, username: string, tagName: string) {
    if(await userExists(userId)) {

        const response = await joinTag(groupId, tagName, userId);

        if(response.state === "ok") {
            const inlineKeyboard = new InlineKeyboard().text("Join this tag", "join-tag");

            const message = '@' + username + ' joined tag ' + tagName + '. They will be notified when someone tags it.';
            await ctx.reply(message, { reply_markup: inlineKeyboard });
        }
        else {
            const message = "⚠️ " + response.message + ', @' + username;
            await ctx.reply(message);
        }
    }
    else {
        const message = "To join <b>tags</b>, @" + username + ", you need to /start the bot";
        const inlineKeyboard = new InlineKeyboard().url("Start the bot and join " + tagName, "https://t.me/" + ctx.me.username + "?start=" + userId + "_" + groupId + "_" + tagName);
        await ctx.reply(message, { reply_markup: inlineKeyboard, parse_mode: "HTML" });
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
    const toSendMessage = "You have been tagged in <b>" + group["title"] + "</b> through the " + tagName + " tag. Click <a href='" + messageLink + "'>here</a> to see the message";
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
        message += "✅ Users in " + tagName + " have been tagged privately. <a href='https://t.me/tagbotchannel/7'>Why?</a>\n";

    //If the bot was not able to contact at least one user..
    if(notContacted.length > 0) 
        message += "⚠️ These users didn't start the bot in private: " + notContacted.join(", ");


    const sentMessage = await ctx.reply(message, { 
        reply_to_message_id: ctx.msg.message_id,
        parse_mode: "HTML",
        disable_web_page_preview: true
    });

    setTimeout(() => {
        void ctx.api.deleteMessage(ctx.chat.id, sentMessage.message_id);
    }, 5000);
}