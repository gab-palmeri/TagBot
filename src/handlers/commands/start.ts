import UserRepository from "db/user/user.repository";
import { MyContext } from "utils/customTypes";

export async function startCommandHandler(ctx: MyContext) {

    if(ctx.chat.type == "private") {
        const userRepository = new UserRepository();
        const userId = ctx.chatId.toString();
        const user = await userRepository.getUser(userId);

        if(user === null) {
            await userRepository.saveUser(userId, ctx.chat.username || "");
        }
        else if(!user.hasBotStarted) {
            await userRepository.update(userId, {hasBotStarted: true});
        }
    }

    return ctx.reply(ctx.t("start"), { parse_mode: "Markdown", link_preview_options: { is_disabled: true }});
   
}