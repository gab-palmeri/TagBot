import { MyContext } from "utils/customTypes";
import GroupRepository from "db/group/group.repository";
import UserRepository from "db/user/user.repository";

export async function broadcastHandler(ctx: MyContext) {
    if (!ctx.msg?.text) return;

    // Rimuove il comando dal messaggio, supporta multilinea
    const message = ctx.msg.text.replace(/^\/broadcast(@\w+)?\s*/i, "").trim();

    if (!message) {
        return ctx.reply("Syntax: /broadcast <message>");
    }

    await ctx.reply("Starting broadcast...");

    const groupRepository = new GroupRepository();
    const userRepository = new UserRepository();

    let successCount = 0;
    let errorCount = 0;

    try {
        const activeGroups = await groupRepository.getAllActiveGroups();
        const activeUsers = await userRepository.getAllActiveUsers();

        const allChatIds = [...activeGroups.map(g => g.groupId), ...activeUsers.map(u => u.userId)];

        for (const chatId of allChatIds) {
            try {
                await ctx.api.sendMessage(chatId, message, { parse_mode: "HTML", link_preview_options: { is_disabled: true }});
                await new Promise(resolve => setTimeout(resolve, 2000));
                successCount++;
            } catch (error) {
                console.error(`Impossible to sent message to ${chatId}:`, error);
                errorCount++;
            }
        }

        await ctx.reply(
            `Broadcast ended.\n\n` +
            `Successful: ${successCount} chat.\n` +
            `Failed: ${errorCount} chat.`
        );
    } catch (error) {
        console.error("Error during broadcast:", error);
        await ctx.reply("Error during broadcast. Check logs");
    }
}