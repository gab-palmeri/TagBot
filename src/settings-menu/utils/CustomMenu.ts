import { Menu, MenuOptions, MenuRange } from "@grammyjs/menu";
import { Context, NextFunction } from "grammy";
import { MyContext } from "utils/customTypes";

type Description<C extends Context> = string | ((ctx: C, params?: Record<string, string|number>) => string | Promise<string>);

export class ManagedMenu<C extends MyContext = MyContext> extends Menu<C> {
    public description: Description<C>;
    protected managedParent?: ManagedMenu<C>;

    constructor(id: string, description: Description<C>, options?: MenuOptions<C>) {
        super(id, options);
        this.description = description;
    }

    async renderTitle(ctx: C, params?: Record<string, string|number>) {
        const text = typeof this.description === "function" 
            ? await this.description(ctx,params) 
            : this.description;
        
        try {
            await ctx.editMessageText(text, { parse_mode: "HTML" });
        } catch (e) {
            if (!e.description?.includes("message is not modified") && 
                !e.description?.includes("can't be edited")) {
                console.error(`[ManagedMenu Error:`, e.description);
            }
        }
    }

    override register(menus: Menu<C> | Menu<C>[], parentId?: string): void {
        const menuArray = Array.isArray(menus) ? menus : [menus];
        for (const m of menuArray) {
            if (m instanceof ManagedMenu) {
                m.managedParent = parentId ? (this.at(parentId) as ManagedMenu<C>) : this;
            }
        }
        super.register(menus, parentId);
    }

    override submenu(text: any, targetId: string, ...middleware: unknown[]): this {
        return super.submenu(text, targetId, async (ctx, next) => {
            for (const m of middleware) 
                if (typeof m === "function") await m(ctx);
            const targetMenu = this.at(targetId);
            if (targetMenu instanceof ManagedMenu) {
                await targetMenu.renderTitle(ctx);
            }
            return await next();
        });
    }

    override dynamic(rangeBuilder: (ctx: C, range: MenuRange<C>) => void | Promise<void>): this {
        return super.dynamic(async (ctx, range) => {
            // "Prendiamo in prestito" i metodi submenu e back da questa istanza 
            // e li applichiamo al range dinamico di grammY.
            const originalSubmenu = range.submenu.bind(range);
            const originalBack = range.back.bind(range);

            range.submenu = (text: any, targetId: string, ...mw: unknown[]) => {
                return originalSubmenu(text, targetId, async (sub_ctx: C, next: NextFunction) => {
                    
                    for (const m of mw) 
                        if (typeof m === "function") 
                            await m(sub_ctx);
                    const targetMenu = this.at(targetId);
                    if (targetMenu instanceof ManagedMenu) await targetMenu.renderTitle(ctx);
                    return await next();
                });
            };

            range.back = (text: unknown, ...mw: unknown[]) => {
                return originalBack(text, async (ctx: C, next: NextFunction) => {
                    if (this.managedParent) await this.managedParent.renderTitle(ctx);
                    for (const m of mw) 
                        if (typeof m === "function") 
                            await m(ctx);
                    return await next();
                });
            };

            await rangeBuilder(ctx as C, range);
        });
    }

    override back(text: any, ...middleware: unknown[]): this {
        return super.back(text, async (ctx, next) => {
            for (const m of middleware) 
                if (typeof m === "function") 
                    await m(ctx);

            if (this.managedParent) {
                await this.managedParent.renderTitle(ctx);
            }
            return await next();
        });
    }

    async backTo(ctx: C) {
        const targetMenu = this.managedParent;
        if (targetMenu instanceof ManagedMenu) {
            await targetMenu.renderTitle(ctx);
            await ctx.menu.back({immediate: true});
        }
    } 
}