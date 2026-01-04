import { MyContext } from "@utils/customTypes";
import { groupsMenuDescription } from "@menu/descriptions";
import AdminRepository from "@db/admin/admin.repository";
import groupsMenu from "@menu/groupsMenu";

export async function settingsHandler(ctx: MyContext) {

    const adminRepository = new AdminRepository();

    // Get parameters
    const userId = ctx.from.id.toString();

    // Invoke repository
    const adminResult = await adminRepository.getWithGroups(userId);
    if(adminResult.groups.length === 0) {
        return await ctx.reply(ctx.t("admin-no-group"), {parse_mode: "Markdown"});
    }
    // Set session data and menu
    ctx.session.groups = adminResult.groups;
    return await ctx.reply(groupsMenuDescription, { parse_mode: "HTML", reply_markup: groupsMenu }); 
}