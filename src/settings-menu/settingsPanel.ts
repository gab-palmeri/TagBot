import { Menu } from "@grammyjs/menu";

import { MyContext } from 'utils/customTypes';

import groupPanel from  "./groupPanel";
import languageMenuPrivate from "./languagePrivate";

import languages from "utils/supportedLanguages";
import generateDescription from "./generateDescription";
import UserRepository from "db/user/user.repository";

//Menu that shows all the groups
const settingsPanel = new Menu<MyContext>("groups-list")
    .dynamic((ctx, range) => {
        for (const group of ctx.session.groups) {
            range.submenu(group.groupName, "control-panel", async ctx => {
                    ctx.session.selectedGroup = group;
                    const description = ctx.t("settings.group-panel", {groupName: ctx.session.selectedGroup.groupName });
                    await ctx.editMessageText(description, {parse_mode:"Markdown"});
                }).row();
        }
    })
    .submenu((ctx: MyContext) => ctx.t("settings.language"), "language-menu-private", async ctx => {
        const userRepository = new UserRepository();
        const user = await userRepository.getUser(ctx.from.id.toString());

        const langEntry = languages.find(l => l.code === user.lang);
        const langName = ctx.t(`language.${langEntry.code}`);
        const langNameAndEmoji = `${langEntry.emoji} ${langName}`;

        const description = generateDescription(ctx.t, "language-private", langNameAndEmoji);
        await ctx.editMessageText(description, {parse_mode:"Markdown"});
    })
    .text((ctx: MyContext) => ctx.t("settings.close"), (ctx) => ctx.deleteMessage());

settingsPanel.register(groupPanel);
settingsPanel.register(languageMenuPrivate);


export default settingsPanel;