import { Menu, MenuRange } from "@grammyjs/menu";
import { MyContext } from "utils/customTypes";

import editGroupPermissions from "../utils/editGroupPermissions";
import generateDescription from "./generateDescription";

const renameMenu = new Menu<MyContext>("rename-menu")
    .dynamic((ctx, range: MenuRange<MyContext>) => {
        const permissions = [
            { key: "only-admins", value: 0 },
            { key: "everyone", value: 1 },
            { key: "admins-creators", value: 2 },
        ];

        for (const [i, p] of permissions.entries()) {
            const label = ctx.t(`settings.permissions-${p.key}`);

            range.text(label, async (ctx) => {
                const userId = ctx.chatId.toString();
                const newValue = p.value;

                if (ctx.session.selectedGroup.canRename !== newValue) {
                    const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, { canRename: newValue });

                    if (result) {
                        ctx.session.selectedGroup.canRename = newValue;
                        const description = generateDescription(ctx.t, "rename", newValue);
                        await ctx.editMessageText(description, { parse_mode: "HTML" });
                    } else {
                        return ctx.reply(ctx.t("internal-error"));
                    }
                }
            });

            if (i == 1) {
                range.row();
            }
        }
    }).row()
    .back((ctx: MyContext) => ctx.t("settings.back"), async (ctx) => {
        const message = ctx.t("settings.group-panel", { groupName: ctx.session.selectedGroup.groupName });
        await ctx.editMessageText(message, { parse_mode: "HTML" });
    });

export default renameMenu;
