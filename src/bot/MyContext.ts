import { Context, SessionFlavor } from "grammy";

type MyContext = Context & SessionFlavor<{
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
    }
}>;

export default MyContext;