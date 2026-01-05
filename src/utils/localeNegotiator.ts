import GroupRepository from "db/group/group.repository";
import { MyContext } from "./customTypes";
import UserRepository from "db/user/user.repository";

export default async function localeNegotiator(ctx: MyContext) {

    const chatType = ctx.chat.type;

    if(chatType == "group" || chatType == "supergroup") {
        const groupRepository = new GroupRepository();
        const group = await groupRepository.getGroup(ctx.chat.id.toString());
        if(group)
            return group.lang;
        else
            return "en";
    }

    if(chatType == "private") {
        const userRepository = new UserRepository();
        const user = await userRepository.getUser(ctx.from.id.toString());
        if(user)
            return user.lang;
        else
            return "en";
    
    }    
}