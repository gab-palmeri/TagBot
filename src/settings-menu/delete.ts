import { Menu, MenuRange } from "@grammyjs/menu";
import { MyContext } from "utils/customTypes";

import editGroupPermissions from "./editGroupPermissions";
import generateDescription from "./generateDescription";

const deleteMenu = new Menu<MyContext>("delete-menu")
    .dynamic((ctx, range: MenuRange<MyContext>) => {
        const permissions = [
            { key: "only-admins", value: 0 },
            { key: "everyone", value: 1 },
            { key: "admins-creators", value: 2 },
        ];

        for (const [i, option] of permissions.entries()) {
            const label = ctx.t(`settings.permissions-${option.key}`);

            range.text(label, async (ctx) => {
                const userId = ctx.chatId.toString();
                const newValue = option.value;

                if (ctx.session.selectedGroup.canDelete !== newValue) {
                    const result = await editGroupPermissions(ctx.session.selectedGroup.groupId, userId, { canDelete: newValue });

                    if (result) {
                        ctx.session.selectedGroup.canDelete = newValue;
                        const description = generateDescription(ctx.t, "delete", newValue);
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

export default deleteMenu;
