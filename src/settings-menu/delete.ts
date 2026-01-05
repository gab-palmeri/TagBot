import { Menu } from "@grammyjs/menu";
import {MyContext} from "utils/customTypes";

import editGroupPermissions from "./editGroupPermissions";
import generateDescription from "./generateDescription";

const deleteMenu = new Menu<MyContext>("delete-menu")
    .text(ctx => ctx.t("settings.permissions-only-admins"), async (ctx) => {

        const userId = ctx.chatId.toString();

        if(ctx.session.selectedGroup.canDelete !== 0) {
            const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canDelete: 0});
            if(result) {
                ctx.session.selectedGroup.canDelete = 0;
                const description = generateDescription(ctx.t, "delete", ctx.session.selectedGroup.canDelete);
                await ctx.editMessageText(description, {parse_mode:"Markdown"});
            }
            else {
                return ctx.reply(ctx.t("internal-error"));
            }
        }
    })
    .text(ctx => ctx.t("settings.permissions-everyone"), async (ctx) => {

        const userId = ctx.chatId.toString();

        if(ctx.session.selectedGroup.canDelete !== 1) {
            const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canDelete: 1});
            if(result) {
                ctx.session.selectedGroup.canDelete = 1;
                const description = generateDescription(ctx.t, "delete", ctx.session.selectedGroup.canDelete);
                await ctx.editMessageText(description, {parse_mode:"Markdown"});
            }
            else {
                return ctx.reply(ctx.t("internal-error"));
            }
        }
    }).row()
    .text(ctx => ctx.t("settings.permissions-admins-creators"), async (ctx) => {

        const userId = ctx.chatId.toString();

        if(ctx.session.selectedGroup.canDelete !== 2) {
            const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, {canDelete: 2});
            if(result) {
                ctx.session.selectedGroup.canDelete = 2;
                const description = generateDescription(ctx.t, "delete", ctx.session.selectedGroup.canDelete);
                await ctx.editMessageText(description, {parse_mode:"Markdown"});
            }
            else {
                return ctx.reply(ctx.t("internal-error"));
            }
        }
    }).row()

    .back((ctx: MyContext) => ctx.t("settings.back"), async ctx => {
        const message = ctx.t("settings.group-panel", {groupName: ctx.session.selectedGroup.groupName });
        await ctx.editMessageText(message, {parse_mode:"Markdown"});
    });

export default deleteMenu;