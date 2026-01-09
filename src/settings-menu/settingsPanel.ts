import { MyContext } from 'utils/customTypes';
import { ManagedMenu } from "./utils/CustomMenu";

import groupPanel from "./groupPanel";
import languageMenuPrivate from "./language/languagePrivate";

import AdminRepository from "db/admin/admin.repository";

// Main settings panel
const settingsPanel = new ManagedMenu<MyContext>(
    "groups-list",
    (ctx) => `${ctx.t("settings-main.header")}\n\n${ctx.t("settings-main.description")}`
);

settingsPanel
    .dynamic(async (ctx, range) => {
        const adminRepository = new AdminRepository();
        const userId = ctx.from.id.toString();
        const admin = await adminRepository.getWithGroups(userId);

        for (const group of admin.groups) {
            range.submenu(group.groupName, "group-panel", async (ctx) => {
                ctx.session.selectedGroup = group;
            }).row();
        }
    })
    .submenu(
        (ctx) => ctx.t("settings-language.btn"), 
        "language-menu-private"
    )
    .text(
        (ctx) => ctx.t("settings-misc.close"), 
        (ctx) => ctx.deleteMessage()
    );

settingsPanel.register([groupPanel, languageMenuPrivate]);

export default settingsPanel;