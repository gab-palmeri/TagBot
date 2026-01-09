import { MyContext } from "utils/customTypes";
import { ManagedMenu } from "../utils/CustomMenu";

import permissions from "./permissions";
import editGroupPermissions from "../../utils/editGroupPermissions";

/* ---------- CREATE MENU ---------- */
const createMenu = new ManagedMenu<MyContext>(
    "create-menu",
    (ctx) => {
        const main = ctx.t("settings-main.header");
        const group = ctx.t("settings-group.header", { groupName: ctx.session.selectedGroup.groupName });
        const createHeader = ctx.t("settings-create.header");
        const createDesc = ctx.t("settings-create.description");
        const perm = permissions.find((p) => p.value === ctx.session.selectedGroup.canCreate).key;
        const currentSetting = ctx.t("settings-current", { current: ctx.t(`settings-permissions.${perm}`) });

        return `${main}\n\n${group}\n\n${createHeader}\n\n${createDesc}\n${currentSetting}`;        
    }
);

createMenu.dynamic((ctx, range) => {
    const permissions = [{ key: "only-admins", value: 0 }, { key: "everyone", value: 1 }];
    
    for (const p of permissions) {
        range.text(ctx.t(`settings-permissions.${p.key}`), async (ctx) => {
            const userId = ctx.chatId.toString();
            const { groupId, canCreate } = ctx.session.selectedGroup;

            if (canCreate !== p.value) {
                const result = await editGroupPermissions(groupId, userId, { canCreate: p.value });
                if (result) {
                    ctx.session.selectedGroup.canCreate = p.value;
                    await createMenu.renderTitle(ctx);
                } else {
                    await ctx.answerCallbackQuery(ctx.t("internal-error"));
                }
            }
        });
    }
}).row().back((ctx) => ctx.t("settings-misc.back"));

export default createMenu;