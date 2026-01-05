import GroupRepository from "db/group/group.repository";
import { MyContext } from "./customTypes";
import UserRepository from "db/user/user.repository";

export default async function localeNegotiator(ctx: MyContext) {

    const chatType = ctx.chat.type;

    if(chatType == "group" || chatType == "supergroup") {
        const groupRepository = new GroupRepository();
        const group = await groupRepository.getGroup(ctx.chat.id.toString());
        return group.lang;   
    }

    if(chatType == "private") {
        const userRepository = new UserRepository();
        const user = await userRepository.getUser(ctx.from.id.toString());
        return user.lang;
    }    
}