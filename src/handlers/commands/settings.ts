import { MyContext } from "utils/customTypes";
import AdminRepository from "db/admin/admin.repository";
import groupsMenu from "settings-menu/settingsPanel";


export async function settingsHandler(ctx: MyContext) {

    const adminRepository = new AdminRepository();

    // Get parameters
    const userId = ctx.from.id.toString();

    // Invoke repository
    const adminResult = await adminRepository.getWithGroups(userId);
    if(adminResult.groups.length === 0) {
        return await ctx.reply(ctx.t("admin.no-groups"), {parse_mode: "Markdown"});
    }
    // Set session data and menu
    ctx.session.groups = adminResult.groups;
    return await ctx.reply(ctx.t("settings.main"), { parse_mode: "Markdown", reply_markup: groupsMenu }); 
}