import { Context, SessionFlavor } from "grammy";
import { GroupDTO } from "@db/group/group.dto";
import { I18nFlavor } from "@grammyjs/i18n";

export type MyContext = Context & I18nFlavor & SessionFlavor<{
    groups: Groups, 
    selectedGroup: GroupDTO | null,
    lastUsedTags: LastUsedTags
}>;

export type Groups = GroupDTO[]

export type LastUsedTags = {
    userId: string,
    timestamps: number[],
}[]