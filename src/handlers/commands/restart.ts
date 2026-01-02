import AdminRepository from "@db/admin/admin.repository";
import { MyContext } from "@utils/customTypes";
import { restartSuccessMessage, restartErrorMessage } from "@utils/messages/generalMessages";


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
        return await ctx.reply(restartSuccessMessage);
    }
    catch(e) {
        await ctx.reply(restartErrorMessage);
        throw e;
    }
}