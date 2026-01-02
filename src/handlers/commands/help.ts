import { MyContext } from "@utils/customTypes";
import { helpMessage } from "@utils/messages/generalMessages";

export async function helpCommandHandler(ctx: MyContext) {
    // Reply with help message
    return await ctx.reply(helpMessage, { parse_mode: "HTML" });
}