import { MyContext } from "utils/customTypes";

export async function startCommandHandler(ctx: MyContext) {

    return ctx.reply(ctx.t("start"), { parse_mode: "Markdown", link_preview_options: { is_disabled: true }});
   
}