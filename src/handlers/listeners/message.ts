import { MyContext } from "@utils/customTypes";
import UserRepository from "@db/user/user.repository";

export async function messageHandler(ctx: MyContext) {

    const userRepository = new UserRepository();
    // Invoke user retrieval
    const result = await userRepository.getUser(ctx.from.id.toString());

    //Check that the user.username is equal to the ctx.from.username
    if(result.ok === true) {
        if(result.value.username !== ctx.from.username) {
            //If not, update the user
            await userRepository.updateUserUsername(ctx.from.id.toString(), ctx.from.username);
        }
    }
}