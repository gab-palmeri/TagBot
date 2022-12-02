import { Context, SessionFlavor } from "grammy";

export type MyContext = Context & SessionFlavor<{
    groups: Groups, 
    selectedGroup: SelectedGroup,
    lastUsedTags: LastUsedTags
}>;

type Groups = {
    groupName:string, 
    groupId:number,
    canCreate:number,
    canDelete:number,
    canRename:number,
    canAddUsers:number,
    canRemUsers:number,
}[]

type SelectedGroup = {
    groupName:string, 
    groupId:number,
    canCreate:number,
    canDelete:number,
    canRename:number,
    canAddUsers:number,
    canRemUsers:number,
}


export type LastUsedTags = {
    userId: string,
    timestamps: number[],
}[]