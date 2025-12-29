import { MyContext } from "@utils/customTypes";
import { startMessage } from "@utils/messages/generalMessages";

export function startCommandHandler(ctx: MyContext) {
    return ctx.reply(
        startMessage,
        {
            parse_mode: "HTML",
            link_preview_options: { is_disabled: true }
        }
    );    
}