import { Context, SessionFlavor } from "grammy";

type MyContext = Context & SessionFlavor<{groups: {groupName:string, groupId:number}[], selectedGroup: {groupName:string, groupId:number}}>;

export default MyContext;