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
        return await ctx.reply(ctx.t("admin.no-groups"), {parse_mode: "HTML"});
    }
    // Set session data and menu
    const message = ctx.t("settings-main.header") + "\n\n" + ctx.t("settings-main.description");
    return await ctx.reply(message, { parse_mode: "HTML", reply_markup: groupsMenu }); 
}