import { Menu } from "@grammyjs/menu";
import {MyContext} from "utils/customTypes";

const languages = [
    { "name": "Italian", "code": "it"},
    { "name": "English", "code": "en"}
];

const languageMenu = new Menu<MyContext>("language-menu")
    .dynamic((ctx, range) => {
        console.log(ctx.i18n);
        for (const l of languages) {
            range.text(ctx => ctx.session.__language_code == l.code ? `👉🏻 ${l.name}` : `${l.name}`, async (ctx) => {
                if(ctx.session.__language_code !== l.code) {
                    ctx.session.__language_code = l.code;
                    ctx.menu.update();
                }
            });
        }
    });

export default languageMenu;