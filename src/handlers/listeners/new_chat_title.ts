import { MyContext } from "utils/customTypes";
import GroupRepository from "db/group/group.repository";

export async function newChatTitleHandler(ctx: MyContext) {
    const groupRepository = new GroupRepository();
    await groupRepository.update(ctx.chatId.toString(), {groupName: ctx.msg.new_chat_title});
}