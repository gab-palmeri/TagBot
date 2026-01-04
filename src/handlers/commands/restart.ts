import AdminRepository from "@db/admin/admin.repository";
import { MyContext } from "@utils/customTypes";


export async function restartHandler(ctx: MyContext) {

    const adminRepository = new AdminRepository();

    // Take parameters
    const groupId = ctx.chatId.toString();
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const adminIDs = adminList.map(admin => admin.user.id.toString());

    // Invoke repository
    try {
        await adminRepository.deleteAllAdmins(groupId);
        await adminRepository.addAdmins(groupId, adminIDs);
        return await ctx.reply(ctx.t("restart-success"), {parse_mode: "Markdown"});
    }
    catch(e) {
        await ctx.reply(ctx.t("restart-error"), {parse_mode: "Markdown"});
        throw e;
    }
}