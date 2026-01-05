import { Menu } from "@grammyjs/menu";

import { MyContext } from 'utils/customTypes';

import createMenu from "./create";
import deleteMenu from "./delete";
import renameMenu from "./rename";
import languageMenu from "./language";

import generateDescription from "./generateDescription";
import languages from "utils/supportedLanguages";


//Control Panel Menu for a single group
const groupPanel = new Menu<MyContext>("control-panel")
    .submenu((ctx: MyContext) => ctx.t("settings.create"), "create-menu", async ctx => {
        const description = generateDescription(ctx.t, "create", ctx.session.selectedGroup.canCreate);
        await ctx.editMessageText(description, {parse_mode:"Markdown"});
    })
    .submenu((ctx: MyContext) => ctx.t("settings.delete"), "delete-menu", async ctx => {
        const description = generateDescription(ctx.t, "delete", ctx.session.selectedGroup.canDelete);
        console.log("test");
        await ctx.editMessageText(description, {parse_mode:"Markdown"});
    }).row()
    .submenu((ctx: MyContext) => ctx.t("settings.rename"), "rename-menu", async ctx => {
        const description = generateDescription(ctx.t, "rename", ctx.session.selectedGroup.canRename);
        await ctx.editMessageText(description, {parse_mode:"Markdown"});
    }).row()
    .submenu((ctx: MyContext) => ctx.t("settings.language"), "language-menu", async ctx => {
        const langEntry = languages.find(l => l.code === ctx.session.selectedGroup.lang);
        const langName = langEntry ? `${langEntry.emoji} ${langEntry.name}` : "Unknown";
        const description = generateDescription(ctx.t, "language", langName);
        await ctx.editMessageText(description, {parse_mode:"Markdown"});
    })
    .back((ctx: MyContext) => ctx.t("settings.back"), ctx => ctx.editMessageText(ctx.t("settings.create-description"), {parse_mode:"Markdown"})).row();

groupPanel.register(createMenu);
groupPanel.register(deleteMenu);
groupPanel.register(renameMenu);
groupPanel.register(languageMenu);

export default groupPanel;