import { Composer } from "grammy";
import { MyContext } from "@utils/customTypes";
import { checkIfPrivate } from "shared/middlewares";

import AdminServices from "./admin.services";

import groupsMenu from "@menu/groupsMenu";
import { groupsMenuDescription } from "@menu/descriptions";
import AdminRepository from "./admin.repository";

const AdminComposer = new Composer<MyContext>();
const adminServices = new AdminServices(new AdminRepository());


AdminComposer.command("settings", checkIfPrivate, async ctx => {

    // Get user ID
    const userId = ctx.msg.from.id.toString();

    //Call admin services to get admin groups
    const adminResult = await adminServices.getAdminGroups(userId);

    if(adminResult.ok === false) {
        if(adminResult.error === "INTERNAL_ERROR") {
            console.log("Error fetching admin groups");
            return await ctx.reply("⚠️ An internal error occurred. Please try again later.");
        }
        else if(adminResult.error === "NO_CONTENT") {
            return await ctx.reply("⚠️ You are not an admin of any group.");
        }
    }
    
    ctx.session.groups = adminResult.value;
    return await ctx.reply(groupsMenuDescription, { parse_mode: "HTML", reply_markup: groupsMenu });  
});

export default AdminComposer;