import { Composer } from "grammy";
import { checkIfPrivate } from "shared/middlewares";
import UserServices from "./user.services";
import UserRepository from "./user.repository";
import {  } from "@utils/messages/subscriberMessages";
import { startMessage } from "@utils/messages/generalMessages";



const UserComposer = new Composer();
const userService = new UserServices(new UserRepository());


/**************************** */
//TODO: Unificare il comand start per privato e gruppo
UserComposer.command("start", checkIfPrivate, async ctx => {
    await userService.saveUser(ctx.chat.id.toString(), ctx.chat.username || "");
    return await ctx.reply(startMessage, { parse_mode: "HTML" });
});

UserComposer.on("my_chat_member", checkIfPrivate, async ctx => {

    const newStatus = ctx.myChatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();

    if(newStatus !== "member") {
        await userService.deleteUser(groupId.toString());
    }
});

export default UserComposer;