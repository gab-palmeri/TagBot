import GroupRepository from "db/group/group.repository";
import { MyContext } from "./customTypes";

export default async function localeNegotiator(ctx: MyContext) {
    const groupRepository = new GroupRepository();
    const group = await groupRepository.getGroup(ctx.chat.id.toString());
    if(group)
        return group.lang;       
}