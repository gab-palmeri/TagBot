import { MyContext } from "@utils/customTypes";
import TagRepository from "@db/tag/tag.repository";
import { msgRenameSyntaxError, msgRenameTag, msgTagSyntaxError } from "@messages/tagMessages";
import { tagPrivately } from "@utils/tagPrivately";
import { msgPublicTag } from "@messages/subscriberMessages";

export async function renameHandler(ctx: MyContext) {

    const tagRepository = new TagRepository();

    // Take parameters
    const args = ctx.match.toString();
    const [oldTagName, newTagName] = args.trim().split(/\s+/).map(tag => tag.replace(/^#/, ""));
    const groupId = ctx.chatId.toString();
    const username = ctx.from.username || ctx.from.first_name;
    const groupName = ctx.msg.chat.title;

    // Validate parameters
    if(oldTagName.length == 0 || newTagName.length == 0)
        return await ctx.reply(msgRenameSyntaxError);


    const regex = /^(?=[^A-Za-z]*[A-Za-z])[#]{0,1}[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;
    if(!regex.test(oldTagName) || !regex.test(newTagName)) 
        return await ctx.reply(msgTagSyntaxError(username)); 

    const result = await tagRepository.rename(groupId, oldTagName, newTagName);
    
    // Handle response
    if(result.ok === true) {
        const sentMessage = await ctx.reply(msgRenameTag(oldTagName,newTagName,username) , {parse_mode: "HTML"});
        
        //NOTIFY SUBSCRIBERS OF THE TAG RENAMING
        const result = await tagRepository.getSubscribers(newTagName, groupId);

        if(result.ok) {
            //Remove the current user from the subscribers list
            const subscribersWithoutMe = result.value.filter(subscriber => subscriber.userId !== ctx.from.id.toString());
            if(subscribersWithoutMe.length > 0) {
                //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
                if(subscribersWithoutMe.length > 10) {
                    const message = await tagPrivately(ctx, newTagName, groupName, subscribersWithoutMe, sentMessage.message_id);
                    await ctx.reply(message, { 
                        reply_to_message_id: sentMessage.message_id,
                        parse_mode: "HTML",
                        link_preview_options: { is_disabled: true }
                    });
                }
                else {
                    const message = msgPublicTag(subscribersWithoutMe);
                    await ctx.reply(message, { reply_to_message_id: sentMessage.message_id, parse_mode: "HTML" });
                }
            }
        } //TODO: handle error?
    }
    else {
        switch(result.error) {
            case "NOT_FOUND":
                return await ctx.reply(`⚠️ Tag <b>#${oldTagName}</b> not found (@${username})`, {parse_mode: "HTML"});
            case "ALREADY_EXISTS":
                return await ctx.reply(`⚠️ Tag <b>#${newTagName}</b> already exists (@${username})`, {parse_mode: "HTML"});
            case "DB_ERROR":
                return await ctx.reply(`⚠️ An internal error occurred while renaming the tag (@${username})`, {parse_mode: "HTML"});
        }
    }
}