import { CommandContext } from "grammy";
import { createGroup, migrateGroup, loadAdminList, addAdmin, removeAdmin } from "../services/generalServices";

import MyContext from '../MyContext';

export default class GeneralController {

	public static async start(ctx: CommandContext<MyContext>) {
		await ctx.reply(
			"Hi! I'm a bot that allows you to *create* and *manage* grouptags. Type */help* to see the *list of commands.*",
			{ parse_mode: "Markdown" }
		); 
	}

	public static async help(ctx: CommandContext<MyContext>) {
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
	}

	public static async onGroupJoin(ctx: CommandContext<MyContext>) {

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
			await ctx.reply("It's good to be back! Type /help to see the list of commands.");
		}
		else {
			await ctx.reply("❌ An error occurred while setting up. Try adding me again.");
			await ctx.leaveChat();
		}
	}

	public static async onGroupPromotion(ctx: CommandContext<MyContext>) {
		if(ctx.myChatMember.old_chat_member.status === "member" && ctx.myChatMember.new_chat_member.status === "administrator") {
			await ctx.reply("Now i'm fully operational!");
		}
	}

	public static async onGroupMigrate(ctx: CommandContext<MyContext>) {
		const response = await migrateGroup(ctx.chat.id, ctx.msg.migrate_to_chat_id);
		if(response.state === "ok")
			await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, "✅ Your group tags have been migrated to the supergroup chat!");
		else 
			await ctx.api.sendMessage(ctx.msg.migrate_to_chat_id, "❌ An error occurred while migrating your group tags to the supergroup chat!");
	}

	public static async restart(ctx: CommandContext<MyContext>) {
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
	}

	public static async onMemberChange(ctx: CommandContext<MyContext>) {

		ctx.chatMember.old_chat_member.status === "member" && ctx.chatMember.new_chat_member.status === "administrator"
		&& !ctx.chatMember.new_chat_member.user.is_bot && addAdmin(ctx.chat.id, ctx.chatMember.new_chat_member.user.id);
		
		ctx.chatMember.old_chat_member.status === "administrator"
		&& (ctx.chatMember.new_chat_member.status === "member" || ctx.chatMember.new_chat_member.status === "left")
		&& !ctx.chatMember.new_chat_member.user.is_bot
		&& removeAdmin(ctx.chat.id, ctx.chatMember.old_chat_member.user.id);
	}
}