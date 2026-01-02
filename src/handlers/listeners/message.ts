import { MyContext } from "@utils/customTypes";
import UserRepository from "@db/user/user.repository";

export async function messageHandler(ctx: MyContext) {

    const userRepository = new UserRepository();
    
    // Invoke user retrieval
    const user = await userRepository.getUser(ctx.from.id.toString());

    if(user.username !== ctx.from.username) {
        //If not, update the user
        await userRepository.updateUserUsername(ctx.from.id.toString(), ctx.from.username);
    }
}