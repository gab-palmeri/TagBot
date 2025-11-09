import { Composer } from "grammy";
import { checkIfPrivate } from "shared/middlewares";
import UserServices from "./user.services";
import UserRepository from "./user.repository";
//import { msgJoinPrivate } from "@utils/messages/subscriberMessages";



const UserComposer = new Composer();
const userService = new UserServices(new UserRepository());


/**************************** */
// UserComposer.command("start", checkIfPrivate, async ctx => {
//     if(ctx.chat.type === "private") {
//         await UserServices.saveUser(ctx.chat.id.toString());

//         const joinArgs = ctx.match.split("_");

//         if(ctx.match.length > 0 && joinArgs.length === 2) {
            
//             const userId = ctx.chat.id.toString();
//             const groupId = joinArgs[0];
//             const tagName = joinArgs[1];

//             const result = await SubscriberServices.joinTag(groupId, tagName, userId);

//             if(result.isSuccess()) {
//                 await ctx.reply(msgJoinPrivate(tagName), { parse_mode: "HTML" });
//             }
//             else {
//                 const message = "⚠️ " + result.error.message;
//                 await ctx.reply(message);
//             }
//         }
//     }
// });

UserComposer.on("my_chat_member", checkIfPrivate, async ctx => {

    const newStatus = ctx.myChatMember.new_chat_member.status;
    const groupId = ctx.chat.id.toString();

    if(newStatus !== "member") {
        await userService.deleteUser(groupId.toString());
    }
});

export default UserComposer;