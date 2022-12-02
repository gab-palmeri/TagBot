import { Context, SessionFlavor } from "grammy";

export type MyContext = Context & SessionFlavor<{
    groups: {
        groupName:string, 
        groupId:number,
        canCreate:number,
        canDelete:number,
        canRename:number,
        canAddUsers:number,
        canRemUsers:number,
    }[], 
    selectedGroup: {
        groupName:string, 
        groupId:number,
        canCreate:number,
        canDelete:number,
        canRename:number,
        canAddUsers:number,
        canRemUsers:number,
    },
    lastUsedTags: LastUsedTags
}>;

export type LastUsedTags = {
    userId: string,
    timestamps: number[],
}[]