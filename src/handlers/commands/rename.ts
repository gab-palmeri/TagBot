import { MyContext } from "@utils/customTypes";
import TagServices from "features/tag/tag.services";
import TagRepository from "features/tag/tag.repository";
import { msgRenameSyntaxError, msgRenameTag, msgTagSyntaxError } from "@messages/tagMessages";
import { tagPrivately } from "shared/helperFunctions";
import { msgPublicTag } from "@messages/subscriberMessages";

export async function renameHandler(ctx: MyContext) {

    const tagService = new TagServices(new TagRepository());

    const args = ctx.match.toString();
    const [oldTagName, newTagName] = args.trim().split(/\s+/);
    const groupId = ctx.update.message.chat.id.toString();
    
    if(oldTagName.length == 0 || newTagName.length == 0)
        return await ctx.reply(msgRenameSyntaxError);

    const issuerUsername = ctx.msg.from.username;

    const result = await tagService.renameTag(groupId, oldTagName, newTagName);
        
    if(result.ok === true) {
        const sentMessage = await ctx.reply(msgRenameTag(oldTagName,newTagName,issuerUsername) , {parse_mode: "HTML"});
        
        //NOTIFY SUBSCRIBERS OF THE TAG RENAMING
        const result = await tagService.getTagSubscribers(newTagName, groupId);

        if(result instanceof Array) {
            //Remove the current user from the subscribers list
            const subscribersWithoutMe = result.filter(subscriber => subscriber.userId !== ctx.from.id.toString());
            if(subscribersWithoutMe.length > 0) {
                //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
                if(result.length > 10) {
                    const groupName = ctx.msg.chat.title;
                    const message = await tagPrivately(ctx, newTagName, groupName, subscribersWithoutMe, sentMessage.message_id);
                    await ctx.reply(message, { 
                        reply_to_message_id: sentMessage.message_id,
                        parse_mode: "HTML",
                        link_preview_options: { is_disabled: true }
                    });
                }
                else {
                    const message = await msgPublicTag(subscribersWithoutMe);
                    await ctx.reply(message, { reply_to_message_id: sentMessage.message_id, parse_mode: "HTML" });
                }
            }
        }
    }
    else {
        switch(result.error) {
            case "INVALID_SYNTAX":
                return await ctx.reply(msgTagSyntaxError(issuerUsername));
            case "NOT_FOUND":
                return await ctx.reply(`⚠️ Tag <b>#${oldTagName}</b> not found (@${issuerUsername})`, {parse_mode: "HTML"});
            case "ALREADY_EXISTS":
                return await ctx.reply(`⚠️ Tag <b>#${newTagName}</b> already exists (@${issuerUsername})`, {parse_mode: "HTML"});
            case "INTERNAL_ERROR":
                return await ctx.reply(`⚠️ An internal error occurred while renaming the tag (@${issuerUsername})`, {parse_mode: "HTML"});
        }
    }
}