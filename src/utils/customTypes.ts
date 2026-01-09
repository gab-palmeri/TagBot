import { Context, SessionFlavor } from "grammy";
import { GroupDTO } from "db/group/group.dto";
import { I18nFlavor } from "@grammyjs/i18n";
import { MenuFlavor } from "@grammyjs/menu";


export type MyContext = Context & I18nFlavor & SessionFlavor<{
    groups: Groups, 
    selectedGroup: GroupDTO | null,
    botJoinedMessageId: number;
    confirmMap: Record<string, boolean>;
}> & MenuFlavor;

export type Groups = GroupDTO[]

export type TranslateFn = (key: string, params?: Record<string, string|number>) => string;