import { Menu } from "@grammyjs/menu";
import GroupRepository from "db/group/group.repository";
import {MyContext} from "utils/customTypes";
import generateDescription from "./generateDescription";

import languages from "../utils/supportedLanguages";

const languageMenuGroup = new Menu<MyContext>("language-menu-group")
    .dynamic((ctx, range) => {
        
        const groupRepository = new GroupRepository();
        const group = ctx.session.selectedGroup;

        for (const l of languages) {

            const langName = ctx.t(`language.${l.code}`);

            range.text(`${l.emoji} ${langName}`, async (ctx) => {
                if(group.lang !== l.code) {
                    await groupRepository.update(group.groupId, {lang: l.code});
                    group.lang = l.code;
                    const description = generateDescription(ctx.t, "language-group", `${l.emoji} ${langName}`);
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

export default languageMenuGroup;