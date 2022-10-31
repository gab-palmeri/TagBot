import MyContext from "../MyContext";

//This function tags the users directly in the group
export async function tagPublicly(ctx: MyContext, groupId: number, subscribers: string[], messageToReplyTo: number) {
    
    const subscribersWithoutMe = subscribers.filter(subscriber => subscriber != ctx.msg.from.id.toString());

    if(subscribersWithoutMe.length == 0)
        await ctx.reply("⚠️ You're the only one subscribed to this tag", { reply_to_message_id: messageToReplyTo });

    const usernames = await Promise.all(subscribersWithoutMe.map(async (subscriber: string) => {
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

    const subscribersWithoutMe = subscribers.filter(subscriber => subscriber != ctx.msg.from.id.toString());
    
    //get the group name
    const group = await ctx.api.getChat(ctx.msg.chat.id);

    const toSendMessage = "You have been tagged in <b>" + group["title"] + "</b> through the " + tagName + " tag. Click <a href='" + messageLink + "'>here</a> to see the message";

    for(const subscriber of subscribersWithoutMe) {
        try {
            await ctx.api.sendMessage(subscriber, toSendMessage, { parse_mode: "HTML" });
        } catch(error) {
            notContacted.push((await ctx.getChatMember(parseInt(subscriber))).user.first_name);
        }
    }

    let message = "";

    if(subscribersWithoutMe.length == 0)
        message = "⚠️ You are the only one subscribed to this tag";

    //if at least one user was privately tagged successfully..
    if(subscribersWithoutMe.length > notContacted.length)
        message += "✅ Users in " + tagName + " have been tagged privately.\n";

    //If the bot was not able to contact at least one user..
    if(notContacted.length > 0) 
        message += "⚠️ These users didn't start the bot in private: " + notContacted.join(", ");
    

    const sentMessage = await ctx.reply(message, { 
        reply_to_message_id: ctx.msg.message_id
    });

    setTimeout(() => {
        void ctx.api.deleteMessage(ctx.chat.id, sentMessage.message_id);
    }, 5000);
}