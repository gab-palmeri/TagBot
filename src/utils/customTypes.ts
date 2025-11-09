import { Context, SessionFlavor } from "grammy";
import { GroupDTO } from "features/group/group.dto";

export type MyContext = Context & SessionFlavor<{
    groups: Groups, 
    selectedGroup: SelectedGroup,
    lastUsedTags: LastUsedTags
}>;

type Groups = GroupDTO[]

type SelectedGroup = GroupDTO


export type LastUsedTags = {
    userId: string,
    timestamps: number[],
}[]