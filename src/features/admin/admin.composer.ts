import { Composer } from "grammy";
import { MyContext } from "@utils/customTypes";
import { checkIfPrivate } from "shared/middlewares";

import AdminServices from "./admin.services";

import groupsMenu from "@menu/groupsMenu";
import { groupsMenuDescription } from "@menu/descriptions";

const AdminComposer = new Composer<MyContext>();


AdminComposer.command("settings", checkIfPrivate, async ctx => {

    // Get user ID
    const userId = ctx.msg.from.id.toString();

    //Call admin services to get admin groups
    const groups = await AdminServices.getAdminGroups(userId);

    if(typeof groups === 'string') {
        return await ctx.reply(groups);
    }
    
    ctx.session.groups = groups;
    return await ctx.reply(groupsMenuDescription, { parse_mode: "HTML", reply_markup: groupsMenu });  
});

export default AdminComposer;