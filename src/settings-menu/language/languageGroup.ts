import { MyContext } from 'utils/customTypes';
import { ManagedMenu } from "../utils/CustomMenu";

import languages from "../../utils/supportedLanguages";
import GroupRepository from "db/group/group.repository";

const languageMenuGroup = new ManagedMenu<MyContext>(
    "language-menu-group",
    (ctx) => {
        const selectedGroup = ctx.session.selectedGroup;

        const langEntry = languages.find(l => l.code === selectedGroup?.lang);
        const langName = ctx.t(`language.${langEntry?.code || 'en'}`);
        const langNameAndEmoji = `${langEntry?.emoji || ''} ${langName}`;

        const main = ctx.t("settings-main.header");
        const group = ctx.t("settings-group.header", {groupName: selectedGroup.groupName});
        const header = ctx.t("settings-language.header");
        const description = ctx.t("settings-language.description-group");
        const currentSetting = ctx.t("settings-language.current", {current: langNameAndEmoji});

        return `${main}\n\n${group}\n\n${header}\n\n${description}\n${currentSetting}`;

    }
);

languageMenuGroup.dynamic((ctx, range) => {
    const groupRepository = new GroupRepository();
    const group = ctx.session.selectedGroup;

    for (const l of languages) {
        const langLabel = `${l.emoji} ${ctx.t(`language.${l.code}`)}`;

        range.text(langLabel, async (ctx) => {
            if (group.lang !== l.code) {
                await groupRepository.update(group.groupId, { lang: l.code });

                group.lang = l.code;
                await languageMenuGroup.renderTitle(ctx);
            }
        });
    }
    range.row();
}).back((ctx) => ctx.t("settings-misc.back"));

export default languageMenuGroup;