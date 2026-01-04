import { MyContext } from "@utils/customTypes";

import { SubscriberDTO } from "db/subscriber/subscriber.dto";

//This function sends a private message to each user subscribed to the tag
export async function tagPrivately(ctx: MyContext, tagName: string, groupName: string, subscribers: SubscriberDTO[], messageToReplyTo: number) {
    const messageLink = "https://t.me/c/" + ctx.msg.chat.id.toString().slice(4) + "/" + messageToReplyTo;
    const notContacted = [];

    // const toSendMessage = msgPrivateTag(tagName, groupName, messageLink);
    const toSendMessage = ctx.t("tag.private-message", {tagName, groupName, messageLink});

    for(const subscriber of subscribers) {
        try {
            await ctx.api.sendMessage(subscriber.userId, toSendMessage, { parse_mode: "Markdown" });
        } catch(e) {
            notContacted.push((await ctx.getChatMember(parseInt(subscriber.userId))).user.first_name);
        }
    }

    let message = "";

    //if at least one user was privately tagged successfully..
    if(subscribers.length > notContacted.length)
        message += ctx.t("tag.private-ok", {tagName});


    //If the bot was not able to contact at least one user..
    if(notContacted.length > 0) 
        message += ctx.t("tag.private-error", {notContacted: notContacted.join(", ")});

    return message;

    
}