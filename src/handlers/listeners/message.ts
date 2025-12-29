import { MyContext } from "@utils/customTypes";
import UserServices from "features/user/user.services";
import UserRepository from "features/user/user.repository";

export async function messageHandler(ctx: MyContext) {

    const userService = new UserServices(new UserRepository());

    const result = await userService.getUser(ctx.from.id.toString());

    //Check that the user.username is equal to the ctx.from.username
    if(result.ok === true) {
        if(result.value.username !== ctx.from.username) {
            //If not, update the user
            await userService.updateUserUsername(ctx.from.id.toString(), ctx.from.username);
        }
    }
}