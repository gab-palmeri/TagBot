import { Composer } from "grammy";
import MyContext from "../MyContext";
import { createTag, deleteTag, getAdminGroups, renameTag } from "../services/adminServices";

import menu from "../menu/ControlPanel";
import { checkIfGroup, checkIfPrivate, canCreate, canUpdate } from "../middlewares";

const AdminComposer = new Composer<MyContext>();


AdminComposer.command("create", checkIfGroup, canCreate, async ctx => {
    const args = ctx.match.toString();
    const tagName = args.trim();

    //const tagName = ctx.match.toString();
    const issuerUsername = ctx.msg.from.username;

    //tagName must be at least 3 characters long and can contain only letters, numbers and underscores
    const regex = /^[a-zA-Z0-9_]{3,32}$/;

    if(tagName.length == 0)
        return await ctx.reply("⚠️ Syntax: /create tagname");

    if(!regex.test(tagName)) 
        return await ctx.reply("⚠️ Tag must be at least 3 characters long and can contain only letters, numbers and underscores, @" + issuerUsername);
    
    
    const groupId = ctx.msg.chat.id;
    const response = await createTag(groupId, tagName, ctx.msg.from.id);

    if(response.state === "ok") {
        await ctx.reply('✅ Created tag ' + tagName + ' (@' + issuerUsername + ')');
    }
    else {
        await ctx.reply('⚠️ ' + response.message + ', @' + issuerUsername);
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
    "⚠️ " + response.message + ', @' + issuerUsername;
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
    "⚠️ " + response.message + ", @" + issuerUsername;

    await ctx.reply(message, {parse_mode: "HTML"});
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