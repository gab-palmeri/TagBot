import { Menu } from "@grammyjs/menu";

import { MyContext } from '../../customTypes';

import Create from "./createMenu";
import Delete from "./deleteMenu";
import Rename from "./renameMenu";

//Control Panel Menu for a single group
const controlPanel = new Menu<MyContext>("control-panel")
    .submenu("✏️ Create", "create-menu", ctx => ctx.editMessageText("Who can create tags?"))
    .submenu("💣 Delete", "delete-menu", ctx => ctx.editMessageText("Who can delete tags?")).row()
    .submenu("✍️ Rename", "rename-menu", ctx => ctx.editMessageText("Who can rename tags?"))
    .back("Back", ctx => ctx.editMessageText("<b>TagBot Control Panel</b>\n\n👉🏻  <i><u>Select the group</u> you want to edit.</i>", {parse_mode:"HTML"})).row();

controlPanel.register(Create);
controlPanel.register(Delete);
controlPanel.register(Rename);

export default controlPanel;