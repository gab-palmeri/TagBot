import { Composer } from "grammy";
import {MyContext} from "../customTypes";
import TagServices from "../services/TagServices";

import { checkIfGroup, canCreate, canUpdate } from "../middlewares";

import { msgCreateSyntaxError, msgDeleteSyntaxError, msgRenameSyntaxError, msgTagSyntaxError, msgCreateTag, msgDeleteTag, msgRenameTag } from "../messages/tagMessages";
import { tagPrivately, tagPublicly } from "./helperFunctions";

const TagComposer = new Composer<MyContext>();

TagComposer.command("create", checkIfGroup, canCreate, async ctx => {
    
    //Take params from request
    const issuerUsername = ctx.msg.from.username;
    const args = ctx.match.toString();

    const groupId = ctx.msg.chat.id.toString();
    const userId = ctx.msg.from.id.toString();

    const tagName = args.trim();
    if(tagName.length == 0)
        return await ctx.reply(msgCreateSyntaxError);
    
        
    const result = await TagServices.createTag(groupId, tagName, userId);

    if(result.isFailure()) {
        return await ctx.reply("⚠️ " + result.error.message + ', @' + issuerUsername);
    }  
    else {
        return await ctx.reply(msgCreateTag(tagName, issuerUsername));
    }
        
});

TagComposer.command("delete", checkIfGroup, canUpdate, async ctx => {
    let tagName = ctx.match.toString();
    const issuerUsername = ctx.msg.from.username;

    if (tagName.length == 0)
        return await ctx.reply(msgDeleteSyntaxError);

    const groupId = ctx.update.message.chat.id.toString();

    tagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;

    const result = await TagServices.deleteTag(groupId, tagName);
    result.isSuccess()
    ? await ctx.reply(msgDeleteTag(tagName, issuerUsername))
    : await ctx.reply("⚠️ " + result.error.message + ', @' + issuerUsername);
        
});

TagComposer.command("rename", checkIfGroup, canUpdate, async ctx => {
    const args = ctx.match.toString();
    let [oldTagName, newTagName] = args.trim().split(/\s+/);

    if(oldTagName.length == 0 || newTagName.length == 0)
        return await ctx.reply(msgRenameSyntaxError);

    const issuerUsername = ctx.msg.from.username;
    const regex = /^(?=[^A-Za-z]*[A-Za-z])[#]{0,1}[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;

    if(!regex.test(oldTagName) || !regex.test(newTagName)) 
        return await ctx.reply(msgTagSyntaxError(issuerUsername));

    //if oldTagName or newTagName start with #, remove it
    oldTagName = oldTagName.startsWith("#") ? oldTagName.slice(1) : oldTagName;
    newTagName = newTagName.startsWith("#") ? newTagName.slice(1) : newTagName;

    const groupId = ctx.update.message.chat.id.toString();
    const result = await TagServices.renameTag(groupId, oldTagName, newTagName);

    if(result.isFailure()) {
        return await ctx.reply("⚠️ " + result.error.message + ", @" + issuerUsername, {parse_mode: "HTML"});
    }
        
    else {
        const sentMessage = await ctx.reply(msgRenameTag(oldTagName,newTagName,issuerUsername) , {parse_mode: "HTML"});
        
        //NOTIFY SUBSCRIBERS OF THE TAG RENAMING
        const result = await TagServices.getTagSubscribers(newTagName, groupId);

        if(result.isSuccess()) {
            //Remove the current user from the subscribers list
            const subscribersWithoutMe = result.value.filter(subscriber => subscriber.userId !== ctx.from.id.toString());
            if(subscribersWithoutMe.length > 0) {
                //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
                if(result.value.length > 10) 
                    await tagPrivately(ctx, oldTagName, subscribersWithoutMe, sentMessage.message_id);
                else 
                    await tagPublicly(ctx, groupId, subscribersWithoutMe, sentMessage.message_id);
            }
        }
    }
});

export default TagComposer;