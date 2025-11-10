import { Context, SessionFlavor } from "grammy";
import { GroupDTO } from "features/group/group.dto";

export type MyContext = Context & SessionFlavor<{
    groups: Groups, 
    selectedGroup: GroupDTO | null,
    lastUsedTags: LastUsedTags
}>;

export type Groups = GroupDTO[]

export type LastUsedTags = {
    userId: string,
    timestamps: number[],
}[]