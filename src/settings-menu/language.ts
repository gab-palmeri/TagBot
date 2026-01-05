import { Menu } from "@grammyjs/menu";
import GroupRepository from "db/group/group.repository";
import {MyContext} from "utils/customTypes";
import generateDescription from "./generateDescription";

import languages from "../utils/supportedLanguages";

const languageMenu = new Menu<MyContext>("language-menu")
    .dynamic((ctx, range) => {
        
        const groupRepository = new GroupRepository();
        const group = ctx.session.selectedGroup;

        for (const l of languages) {
            range.text(`${l.emoji} ${l.name}`, async (ctx) => {
                if(group.lang !== l.code) {
                    await groupRepository.setLang(group.groupId, l.code);
                    group.lang = l.code;
                    const description = generateDescription(ctx.t, "language", `${l.emoji} ${l.name}`);
                    await ctx.editMessageText(description, {parse_mode:"Markdown"});
                }
            });
        }
        range.row();
    })
    .back((ctx: MyContext) => ctx.t("settings.back"), async ctx => {
        const message = ctx.t("settings.group-panel", {groupName: ctx.session.selectedGroup.groupName });
        await ctx.editMessageText(message, {parse_mode:"Markdown"});
    });

export default languageMenu;