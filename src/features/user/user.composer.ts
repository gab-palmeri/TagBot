import { Composer } from "grammy";
import { checkIfGroup, checkIfPrivate } from "shared/middlewares";
import UserServices from "./user.services";
import UserRepository from "./user.repository";

const UserComposer = new Composer();
const userService = new UserServices(new UserRepository());

UserComposer.on("my_chat_member", checkIfPrivate, async ctx => {

    const newStatus = ctx.myChatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();

    if(newStatus !== "member") {
        await userService.deleteUser(groupId.toString());
    }
    else {
        await userService.saveUser(groupId.toString(), ctx.chat.username || "");
    }
});

UserComposer.on("message", checkIfGroup, async ctx => {

    const result = await userService.getUser(ctx.from.id.toString());

    //Check that the user.username is equal to the ctx.from.username
    if(result.ok === true) {
        if(result.value.username !== ctx.from.username) {
            //If not, update the user
            await userService.updateUserUsername(ctx.from.id.toString(), ctx.from.username);
        }
    }
});

export default UserComposer;