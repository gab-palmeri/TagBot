import { MyContext } from "@utils/customTypes";

export async function helpCommandHandler(ctx: MyContext) {
    // Reply with help message
    return await ctx.reply(ctx.t("help"), { parse_mode: "Markdown" });
}