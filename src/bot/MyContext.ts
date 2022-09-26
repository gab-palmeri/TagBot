import { Context, SessionFlavor } from "grammy";

type MyContext = Context & SessionFlavor<{groups: {groupName:string, groupId:number}[], selectedGroup:number}>;

export default MyContext;