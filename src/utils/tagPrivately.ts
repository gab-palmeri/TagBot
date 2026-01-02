import { MyContext } from "@utils/customTypes";


import { msgPrivateTag, msgPrivateTagError, msgPrivateTagResponse } from "@messages/subscriberMessages";
import { SubscriberDTO } from "db/subscriber/subscriber.dto";


//This function sends a private message to each user subscribed to the tag
export async function tagPrivately(ctx: MyContext, tagName: string, groupName: string, subscribers: SubscriberDTO[], messageToReplyTo: number) {
    const messageLink = "https://t.me/c/" + ctx.msg.chat.id.toString().slice(4) + "/" + messageToReplyTo;
    const notContacted = [];

    const toSendMessage = msgPrivateTag(tagName, groupName, messageLink);
    for(const subscriber of subscribers) {
        try {
            await ctx.api.sendMessage(subscriber.userId, toSendMessage, { parse_mode: "HTML" });
        } catch(e) {
            notContacted.push((await ctx.getChatMember(parseInt(subscriber.userId))).user.first_name);
        }
    }

    let message = "";

    //if at least one user was privately tagged successfully..
    if(subscribers.length > notContacted.length)
        message += msgPrivateTagResponse(tagName);

    //If the bot was not able to contact at least one user..
    if(notContacted.length > 0) 
        message += msgPrivateTagError(notContacted.join(", "));

    return message;

    
}