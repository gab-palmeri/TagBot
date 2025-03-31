import { Composer } from "grammy";
import {MyContext} from "../customTypes";
import AdminServices from "../services/AdminServices";

import groupsMenu from "../menu/settings/groupsMenu";
import { groupsMenuDescription } from "../menu/settings/descriptions";
import { checkIfPrivate } from "../middlewares";

const AdminComposer = new Composer<MyContext>();


AdminComposer.command("settings", checkIfPrivate, async ctx => {

    const userId = ctx.msg.from.id.toString();

    const result = await AdminServices.getAdminGroups(userId);
    if(result.isFailure())
        return await ctx.reply("⚠️ " + result.error.message);

    const groups = result.value;

    if(groups.length == 0)
        return await ctx.reply("You are not an admin of any group");
    else {
        ctx.session.groups = groups;
        await ctx.reply(groupsMenuDescription, { parse_mode: "HTML", reply_markup: groupsMenu });
    }
});

export default AdminComposer;