import { Composer } from "grammy";
import {MyContext} from "../customTypes";
import AdminServices from "../services/AdminServices";

import menu from "../menu/ControlPanel";
import { checkIfGroup, checkIfPrivate, canCreate, canUpdate } from "../middlewares";

import { msgCreateSyntaxError, msgDeleteSyntaxError, msgRenameSyntaxError, msgCreateTagError, msgCreateTag, msgDeleteTag, msgRenameTag, msgRenameTagError } from "../messages/adminMessages";
import SubscriberServices from "../services/SubscriberServices";
import { tagPrivately, tagPublicly } from "./helperFunctions";

const AdminComposer = new Composer<MyContext>();


AdminComposer.command("create", checkIfGroup, canCreate, async ctx => {
    const args = ctx.match.toString();
    const tagName = args.trim();

    //const tagName = ctx.match.toString();
    const issuerUsername = ctx.msg.from.username;

    //regex
    //tagName must be at least 3 characters long and can contain only letters, numbers and underscores
    //tagName can't start with _
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;

    if(tagName.length == 0)
        return await ctx.reply(msgCreateSyntaxError);

    if(!regex.test(tagName)) 
        return await ctx.reply(msgCreateTagError(issuerUsername));
    
    
    const groupId = ctx.msg.chat.id;
    const response = await AdminServices.createTag(groupId, tagName, ctx.msg.from.id);

    response.state === "ok"
    ? await ctx.reply(msgCreateTag(tagName, issuerUsername))
    : await ctx.reply('⚠️ ' + response.message + ', @' + issuerUsername);
        
});

AdminComposer.command("delete", checkIfGroup, canUpdate, async ctx => {
    const tagName = ctx.match.toString();
    const issuerUsername = ctx.msg.from.username;

    if (tagName.length == 0)
        return await ctx.reply(msgDeleteSyntaxError);

    const groupId = ctx.update.message.chat.id;

    const response = await AdminServices.deleteTag(groupId, tagName);
    response.state === "ok"
    ? await ctx.reply(msgDeleteTag(tagName, issuerUsername))
    : await ctx.reply("⚠️ " + response.message + ', @' + issuerUsername);
        
});

AdminComposer.command("rename", checkIfGroup, canUpdate, async ctx => {
    const args = ctx.match.toString();
    let [oldTagName, newTagName] = args.trim().split(/\s+/);

    if(oldTagName.length == 0 || newTagName.length == 0)
        return await ctx.reply(msgRenameSyntaxError);
    
    //if oldTagName or newTagName start with #, remove it
    oldTagName = oldTagName.startsWith("#") ? oldTagName.slice(1) : oldTagName;
    newTagName = newTagName.startsWith("#") ? newTagName.slice(1) : newTagName;

    const issuerUsername = ctx.msg.from.username;

    const regex = /^[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;

    if(!regex.test(oldTagName) || !regex.test(newTagName)) 
        return await ctx.reply(msgRenameTagError(issuerUsername));

    const groupId = ctx.update.message.chat.id;
    const response = await AdminServices.renameTag(groupId, oldTagName, newTagName);

    if(response.state !== "ok") {
        return await ctx.reply("⚠️ " + response.message + ", @" + issuerUsername, {parse_mode: "HTML"});
    }
        
    else {
        const sentMessage = await ctx.reply(msgRenameTag(oldTagName,newTagName,issuerUsername) , {parse_mode: "HTML"});
        
        //NOTIFY SUBSCRIBERS OF THE TAG RENAMING
        const subs = await SubscriberServices.getSubscribers(newTagName, groupId);

        if(subs.state === "ok") {
            //Remove the current user from the subscribers list
            const subscribersWithoutMe = subs.payload.filter(subscriber => subscriber.userId !== ctx.from.id.toString());
            if(subscribersWithoutMe.length > 0) {
                //If the tag has more than 10 subscribers, tag them in private. Else tag them in the group
                if(subs.payload.length > 10) 
                    await tagPrivately(ctx, oldTagName, subscribersWithoutMe, sentMessage.message_id);
                else 
                    await tagPublicly(ctx, groupId, subscribersWithoutMe, sentMessage.message_id);
            }
        }
    }


    

});

AdminComposer.command("settings", checkIfPrivate, async ctx => {
    const response = await AdminServices.getAdminGroups(ctx.msg.from.id);
    if(response.state !== "ok")
        return await ctx.reply("⚠️ " + response.message);

    const groups = response.payload;

    //get name of the groups
    const groupsNamesAndIdsAndPermissions = [];
    for(const group of groups) {
        const groupDetails = await ctx.api.getChat(group.groupId);
        if(groupDetails.type !== "private") {
            groupsNamesAndIdsAndPermissions.push({
                groupName: groupDetails.title,
                groupId: group.groupId,
                canCreate: group.canCreate,
                canDelete: group.canDelete,
                canRename: group.canRename,
                canAddUsers: group.canAddUsers,
                canRemUsers: group.canRemUsers,
            });
        }
    }

    ctx.session.groups = groupsNamesAndIdsAndPermissions;

    if(groupsNamesAndIdsAndPermissions.length == 0)
        return await ctx.reply("You are not an admin of any group");

    await ctx.reply("Select a group:", { reply_markup: menu });

});

export default AdminComposer;