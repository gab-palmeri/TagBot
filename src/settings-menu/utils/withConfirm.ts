import { MyContext } from "utils/customTypes";
import { MenuRange } from "@grammyjs/menu";


const withConfirm = (
    ctx: MyContext,
    range: MenuRange<MyContext>,
    id: string,
    labels: { idle: string; confirm: string },
    onConfirm: () => Promise<void> | void
) => {
    const isConfirmed = ctx.session.confirmMap[id] === true;
    
    range.text(isConfirmed ? labels.confirm : labels.idle, async (ctx) => {
        if (!isConfirmed) {
            ctx.session.confirmMap[id] = true;
            return ctx.menu.update();
        } else {
            delete ctx.session.confirmMap[id];
            await onConfirm();
        }
    });
};

export default withConfirm;