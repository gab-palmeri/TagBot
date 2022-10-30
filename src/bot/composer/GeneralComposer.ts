import { Composer } from "grammy";
import { checkIfAdmin, checkIfGroup } from "../middlewares";
import { addAdmin, createGroup, loadAdminList, migrateGroup, removeAdmin } from "../services/generalServices";

const GeneralComposer = new Composer();

GeneralComposer.command("start", async ctx => {
    await ctx.reply(
        "Hi! I'm a bot that allows you to *create* and *manage* grouptags. Type */help* to see the *list of commands.*",
        { parse_mode: "Markdown" }
    ); 
});

GeneralComposer.command("help", async ctx => {
    await ctx.reply(
        "👇 *Here's the list of commands!*\n\n" +
        "🔑 *Admin commands:*\n" +
            '/create tagname -> _Create a new grouptag_\n' +
            '/delete tagname -> _Delete a grouptag_\n' +
            '/addusers tagname <usernames> -> _Add multiple users to a grouptag_\n' +
            '/remusers tagname <usernames> -> _Remove multiple users from a grouptag_\n\n' +
        '👤 *User commands:*\n' +
            '#tagname -> _Tag a grouptag_\n' +
            '/join tagname -> _Join a grouptag_\n' +
            '/leave tagname -> _Leave a grouptag_\n' +
            '/list -> _List all the grouptags_\n' +
            '/mytags -> _List all the grouptags you are subscribed to_',
        { parse_mode: "Markdown" }
    );
});

GeneralComposer.command("restart", checkIfGroup, checkIfAdmin, async ctx => {
    //reload the admin list of the group
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const response = await loadAdminList(ctx.chat.id, adminList.map(admin => admin.user.id));

    if(response.state === "ok") {
        await ctx.reply("✅ Admin list updated!");
    }
    else {
        console.log(response);
        await ctx.reply("❌ An error occurred while updating the admin list.");
    }
});

GeneralComposer.on(["message:new_chat_members:me", "message:group_chat_created", "message:supergroup_chat_created"], async ctx => {
    const adminList = await ctx.api.getChatAdministrators(ctx.chat.id);
    const response = await createGroup(ctx.chat.id, adminList.map(admin => admin.user.id));

    if(response.state === "ok") {
        await ctx.reply(
            "Hi! I'm a bot that allows you to <b>create</b> and <b>manage</b> grouptags. Type <b>/help</b> to see the <b>list of commands.</b> \n\n" +
            "<i>Remember to give me <b>administrator</b> permissions so that I can answer to #tags.</i>",
            { parse_mode: "HTML" }
        );
    }
    else if(response.state === "ALREADY_EXISTS"){
        console.log("test");
        //check if the bot is admin
        let message = "It's good to be back! Type /help to see the list of commands.\n\n";
        message += "<i>Remember to give me <b>administrator</b> permissions so that I can answer to #tags.</i>",

        await ctx.reply(message, {parse_mode: "HTML"});
    }
    else {
        await ctx.reply("❌ An error occurred while setting up. Try adding me again.");
        await ctx.leaveChat();
    }
});

GeneralComposer.on("my_chat_member", async ctx => {
    if(ctx.myChatMember.old_chat_member.status === "member" && ctx.myChatMember.new_chat_member.status === "administrator") {
        await ctx.reply("Now i'm fully operational!");
    }
});

GeneralComposer.on(":migrate_to_chat_id", async ctx => {
    const response = await migrateGroup(ctx.chat.id, ctx.msg.migrate_to_chat_id);
    if(response.state === "ok")
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, "✅ Your group tags have been migrated to the supergroup chat!");
    else 
        await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, "❌ An error occurred while migrating your group tags to the supergroup chat!");
});


GeneralComposer.on("chat_member", async ctx => {
    ctx.chatMember.old_chat_member.status === "member" && ctx.chatMember.new_chat_member.status === "administrator"
    && !ctx.chatMember.new_chat_member.user.is_bot && addAdmin(ctx.chat.id, ctx.chatMember.new_chat_member.user.id);
    
    ctx.chatMember.old_chat_member.status === "administrator"
    && (ctx.chatMember.new_chat_member.status === "member" || ctx.chatMember.new_chat_member.status === "left")
    && !ctx.chatMember.new_chat_member.user.is_bot
    && removeAdmin(ctx.chat.id, ctx.chatMember.old_chat_member.user.id);
});

export default GeneralComposer;