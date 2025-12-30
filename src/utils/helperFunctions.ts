import { MyContext, LastUsedTags } from "@utils/customTypes";


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

export async function isUserFlooding(userId: string, lastUsedTags: LastUsedTags) {
    
    const now = new Date().getTime();

    //lastUsedTags entries contain: userId, list of last three timestamps
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
