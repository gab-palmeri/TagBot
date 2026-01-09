import { MyContext } from 'utils/customTypes';
import { ManagedMenu } from "../utils/CustomMenu";

import languages from "../../utils/supportedLanguages";
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

    for (const l of languages) {
        const langLabel = `${l.emoji} ${ctx.t(`language.${l.code}`)}`;

        range.text(langLabel, async (ctx) => {
            if (user.lang !== l.code) {
                await userRepository.update(user.userId, { lang: l.code });
                
                user.lang = l.code;
                await ctx.i18n.renegotiateLocale();

                await languageMenuPrivate.renderTitle(ctx); 
            }
        });
    }
    range.row();
}).back((ctx) => ctx.t("settings-misc.back"));

export default languageMenuPrivate;