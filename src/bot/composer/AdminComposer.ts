import { Composer } from "grammy";
import MyContext from "../MyContext";
import { createTag, deleteTag, getAdminGroups, renameTag } from "../services/adminServices";
import { getTag, joinTag, leaveTag } from "../services/userServices";

import menu from "../menu/ControlPanel";
import { checkIfGroup, checkIfPrivate, canCreate, canUpdate } from "../middlewares";

const AdminComposer = new Composer<MyContext>();


AdminComposer.command("create", checkIfGroup, canCreate, async ctx => {
    const args = ctx.match.toString();
    const [tagName, ...usernames] = args.trim().split(/\s+/);

    //const tagName = ctx.match.toString();
    const issuerUsername = ctx.msg.from.username;

    //tagName must be at least 3 characters long and can contain only letters, numbers and underscores
    const regex = /^[a-zA-Z0-9_]{3,32}$/;

    if(tagName.length == 0)
        return await ctx.reply("⚠️ Syntax: /create tagname");

    if(!regex.test(tagName)) 
        return await ctx.reply("⚠️ Tag must be at least 3 characters long and can contain only letters, numbers and underscores");
    
    
    const groupId = ctx.msg.chat.id;
    const response = await createTag(groupId, tagName, ctx.msg.from.id);

    if(response.state === "ok") {
        await ctx.reply('✅ Created tag ' + tagName + ' (@' + issuerUsername + ')');
        if(usernames.length > 0) {
            const message = await addUsersToTag(groupId, tagName, usernames);
            await ctx.reply(message + "\n" + ' (@' + issuerUsername + ')');
        }
    }
    else {
        await ctx.reply('⚠️ ' + response.message);
    }
});

AdminComposer.command("delete", checkIfGroup, canUpdate, async ctx => {
    const tagName = ctx.match.toString();
    const issuerUsername = ctx.msg.from.username;

    if (tagName.length == 0)
        return await ctx.reply('⚠️ Syntax: /delete tagname');

    const groupId = ctx.update.message.chat.id;

    const response = await deleteTag(groupId, tagName);
    const message = response.state === 'ok' ? 
    '✅ Deleted tag ' + tagName + ' (@' + issuerUsername + ')' : 
    "⚠️ " + response.message;
    await ctx.reply(message);
});

AdminComposer.command("rename", checkIfGroup, canUpdate, async ctx => {
    const args = ctx.match.toString();
    const [oldTagName, newTagName] = args.trim().split(/\s+/);

    const issuerUsername = ctx.msg.from.username;

    const regex = /^[a-zA-Z0-9_]{3,32}$/;

    if(oldTagName.length == 0 || newTagName.length == 0)
        return await ctx.reply("⚠️ Syntax: /rename oldtagname newtagname");

    if(!regex.test(oldTagName) || !regex.test(newTagName)) 
        return await ctx.reply("⚠️ Tag must be at least 3 characters long and can contain only letters, numbers and underscores");

    const groupId = ctx.update.message.chat.id;
    const response = await renameTag(groupId, oldTagName, newTagName);

    const message = response.state === "ok" ? 
    "✅ Renamed tag <b>" + oldTagName + "</b> to <b>" + newTagName + "</b> (@" + issuerUsername + ")" : 
    "⚠️ " + response.message;

    await ctx.reply(message, {parse_mode: "HTML"});
});

AdminComposer.command("addusers", checkIfGroup, canUpdate, async ctx => {
    const args = ctx.match.toString();
    const [tagName, ...usernames] = args.trim().split(/\s+/);

    const issuerUsername = ctx.msg.from.username;

    //check if the usernames are valid telegram usernames starting with @ and if tag name is valid
    const tagNameRegex = /^[a-zA-Z0-9_]{5,32}$/;

    if(!tagNameRegex.test(tagName))
        return await ctx.reply("⚠️ Tag must be at least 5 characters long and can contain only letters, numbers and underscores");

    if(usernames.length == 0) 
        return await ctx.reply("⚠️ Syntax: /addusers tagname @username1 @username2 ...");

    const tag = await getTag(ctx.update.message.chat.id, tagName);
    if(tag.state !== "ok") 
        return await ctx.reply("⚠️ " + tag.message);
    

    const groupId = ctx.update.message.chat.id;
    const message = addUsersToTag(groupId, tagName, usernames);
    await ctx.reply(message + "\n" + "(@" + issuerUsername + ")");
});

AdminComposer.command("remusers", checkIfGroup, canUpdate, async ctx => {
    const args = ctx.match.toString();
    const [tagName, ...usernames] = args.trim().split(/\s+/);

    const issuerUsername = ctx.msg.from.username;

    //check if the usernames are valid telegram usernames starting with @ and if tag name is valid
    const usernameRegex = /^@[a-zA-Z0-9_]{5,32}$/;
    const tagNameRegex = /^[a-zA-Z0-9_]{5,32}$/;

    if (!tagNameRegex.test(tagName) || usernames.length == 0)
        return await ctx.reply('⚠️ Syntax: /remusers tagname @username1 @username2 ...');

    const tag = await getTag(ctx.update.message.chat.id, tagName);
    if (tag.state !== 'ok') return await ctx.reply(tag.message + ", @" + issuerUsername);

    const groupId = ctx.update.message.chat.id;

    const validUsernames = [];
    const alreadyInUsernames = [];
    const invalidUsernames = [];

    for (const username of usernames) {
        if (!usernameRegex.test(username)) {
            invalidUsernames.push(username);
            continue;
        }

        const response = await leaveTag(groupId, tagName, username.substring(1));
        if (response.state === 'ok') 
            validUsernames.push(username);
        else if (response.state === 'NOT_SUBSCRIBED') 
            alreadyInUsernames.push(username);
    }

    //build reply message based on the results
    const removedMessage = validUsernames.length > 0 ? 
    '✅ Removed ' + validUsernames.join(', ') + ' from tag ' + tagName + '\n' : 
    '';
    const notInMessage = alreadyInUsernames.length > 0 ? 
    '⚠️ Not in tag: ' + alreadyInUsernames.join(', ') + '\n': 
    '';
    const invalidMessage = invalidUsernames.length > 0 ? 
    '🚫 Invalid usernames: ' + invalidUsernames.join(', ') + '\n' : 
    '';

    await ctx.reply(removedMessage + notInMessage + invalidMessage + '\n' + '(@' + issuerUsername + ')');
});

AdminComposer.command("settings", checkIfPrivate, async ctx => {
    const response = await getAdminGroups(ctx.msg.from.id);
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


    await ctx.reply("Select a group:", { reply_markup: menu });

});

export default AdminComposer;


//This code has been put into its own functions to be able to use it in both the create and addusers commands
export async function addUsersToTag(groupId: number, tagName: string, usernames: string | string[]) {

	const usernameRegex = /^@[a-zA-Z0-9_]{5,32}$/;

	const validUsernames = [];
    const alreadyInUsernames = [];
    const invalidUsernames = [];

    const notAddedCosFull = [];

    for(const username of usernames) {

        if(!usernameRegex.test(username)) {
            invalidUsernames.push(username);
            continue;
        }

        const response = await joinTag(groupId, tagName, username.substring(1));
        if(response.state === "ok")
            validUsernames.push(username);
        else if(response.state === "ALREADY_SUBSCRIBED")
            alreadyInUsernames.push(username);
        else if(response.state === "TAG_FULL") {
            //add all the remaining users in "usernames" to notAddedCosFull
            notAddedCosFull.push(...usernames.slice(usernames.indexOf(username)));
            break;
        }
    }

    //build reply message based on the results
    const addedMessage = validUsernames.length > 0 ? 
    "✅ Added " + validUsernames.join(", ") + " to tag " + tagName + "\n" : 
    "";
    const alreadyInMessage = alreadyInUsernames.length > 0 ? 
    "⚠️ Already in tag: " + alreadyInUsernames.join(", ") + "\n" : 
    "";
    const invalidMessage = invalidUsernames.length > 0 ? 
    "🚫 Invalid usernames: " + invalidUsernames.join(", ") + "\n" : 
    "";

    const notAddedMessage = notAddedCosFull.length > 0 ?
    "⚠️ Tag is full, not added: " + notAddedCosFull.join(", ") + "\n" :
    "";

	return addedMessage + alreadyInMessage + invalidMessage + notAddedMessage;
}