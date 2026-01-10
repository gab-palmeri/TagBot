import { MyContext } from 'utils/customTypes';
import { ManagedMenu } from "../utils/CustomMenu";

import languages from "./supportedLanguages";
import UserRepository from "db/user/user.repository";

const languageMenuPrivate = new ManagedMenu<MyContext>(
    "language-menu-private",
    async (ctx) => {
        const userRepository = new UserRepository();
        const user = await userRepository.getUser(ctx.from.id.toString());

        const langEntry = languages.find(l => l.code === user.lang);
        const langName = ctx.t(`language.${langEntry?.code || 'en'}`);
        const langNameAndEmoji = `${langEntry?.emoji || ''} ${langName}`;

        const main = ctx.t("settings-main.header");
        const header = ctx.t("settings-language.header");
        const description = ctx.t("settings-language.description-private");
        const currentSetting = ctx.t("settings-language.current", {current: langNameAndEmoji});

        return `${main}\n\n${header}\n\n${description}\n${currentSetting}`;
    }
);

languageMenuPrivate.dynamic(async (ctx, range) => {
    const userRepository = new UserRepository();
    const user = await userRepository.getUser(ctx.from.id.toString());

    languages.forEach((l,i) => {
        const langLabel = `${l.emoji} ${ctx.t(`language.${l.code}`)}`;

        range.text(langLabel, async (ctx) => {
            if (user.lang !== l.code) {
                await userRepository.update(user.userId, { lang: l.code });
                
                user.lang = l.code;
                await ctx.i18n.renegotiateLocale();

                await languageMenuPrivate.renderTitle(ctx); 
            }
        });
        if (i % 2 !== 0) range.row();
    });

    if (languages.length % 2 !== 0) {
        range.text(" ").row();
    }
})
.row()
.back((ctx) => ctx.t("settings-misc.back"));

export default languageMenuPrivate;