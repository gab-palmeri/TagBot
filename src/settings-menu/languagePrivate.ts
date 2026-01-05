import { Menu } from "@grammyjs/menu";
import {MyContext} from "utils/customTypes";
import generateDescription from "./generateDescription";

import languages from "../utils/supportedLanguages";
import UserRepository from "db/user/user.repository";

const languageMenuPrivate = new Menu<MyContext>("language-menu-private")
    .dynamic(async (ctx, range) => {
        
        const userRepository = new UserRepository();
        const user = await userRepository.getUser(ctx.from.id.toString());

        for (const l of languages) {

            let langName = ctx.t(`language.${l.code}`);

            range.text(`${l.emoji} ${langName}`, async (ctx) => {
                if(user.lang !== l.code) {
                    await userRepository.update(user.userId, {lang: l.code});
                    user.lang = l.code;
                    await ctx.i18n.renegotiateLocale();
                    langName = ctx.t(`language.${l.code}`);

                    const description = generateDescription(ctx.t, "language-private", `${l.emoji} ${langName}`);
                    await ctx.editMessageText(description, {parse_mode:"Markdown"});
                }
            });
        }
        range.row();
    })
    .back((ctx: MyContext) => ctx.t("settings.back"), async ctx => {
        await ctx.editMessageText(ctx.t("settings.main"), {parse_mode:"Markdown"});
    });

export default languageMenuPrivate;