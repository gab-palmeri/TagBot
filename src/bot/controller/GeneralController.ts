import { Context } from "grammy";

export default class GeneralController {

	public static async start(ctx: Context) {
		await ctx.reply(
			"Hi! I'm a bot that allows you to *create* and *manage* grouptags. Type */help* to see the *list of commands.*",
			{ parse_mode: "Markdown" }
		); 
	}

	public static async help(ctx: Context) {
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

	public static async onGroupJoinOrPromotion(ctx: Context) {
		if(ctx.myChatMember.new_chat_member.status === "member") {
			await ctx.reply(
				"Hi\! I'm a bot that allows you to <b>create</b> and <b>manage</b> grouptags. Type <b>/help</b> to see the <b>list of commands.</b> \n\n" +
				"<i>Remember to give me <b>administrator</b> permissions so that I can answer to #tags.</i>",
				{ parse_mode: "HTML" }
			);
		}
		else if(ctx.myChatMember.new_chat_member.status === "administrator") {
			await ctx.reply("Now i'm fully operational!");
		}
	}
}