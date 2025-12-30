import { MyContext } from "@utils/customTypes";
import { groupsMenuDescription } from "@menu/descriptions";
import AdminRepository from "@db/admin/admin.repository";
import groupsMenu from "@menu/groupsMenu";



export async function settingsHandler(ctx: MyContext) {

    const adminRepository = new AdminRepository();

    // Get parameters
    const userId = ctx.from.id.toString();

    // Invoke service
    const adminResult = await adminRepository.getWithGroups(userId);

    // Handle response
    if(adminResult.ok === false) {
        if(adminResult.error === "DB_ERROR") {
            console.log("Error fetching admin groups");
            return await ctx.reply("⚠️ An internal error occurred. Please try again later.");
        }
    }
    else {
        if(adminResult.value.groups.length === 0) {
            return await ctx.reply("⚠️ You are not an admin of any group.");
        }
        // Set session data and menu
        ctx.session.groups = adminResult.value.groups;
        return await ctx.reply(groupsMenuDescription, { parse_mode: "HTML", reply_markup: groupsMenu });  
    }    
}