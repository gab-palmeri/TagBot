import { MyContext } from "utils/customTypes";
import UserRepository from "db/user/user.repository";
import GroupRepository from "db/group/group.repository";

export async function messageHandler(ctx: MyContext) {

    const userRepository = new UserRepository();
    
    if(ctx.msg.new_chat_title) {
        const groupRepository = new GroupRepository();
        await groupRepository.update(ctx.chatId.toString(), {groupName: ctx.msg.new_chat_title});
    }

    // Invoke user retrieval
    const user = await userRepository.getUser(ctx.from.id.toString());

    if(user != null && user.username !== ctx.from.username) {
        //If not, update the user
        await userRepository.update(ctx.from.id.toString(), {username: ctx.from.username || ""});
    }
}