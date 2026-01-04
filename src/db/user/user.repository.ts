import { IUserRepository } from "./user.interfaces";
import { getDb } from '@db/database';
import { UserDTO } from "./user.dto";

export default class UserRepository implements IUserRepository {
    
    public async saveUser(userId: string, username: string) {
        await getDb()
            .insertInto('user')
            .values({ userId: userId.toString(), username: username })
            .execute();
    }

    public async deleteUser(userId: string) {
        await getDb()
            .deleteFrom('user')
            .where('userId', '=', userId)
            .execute();
    }

    public async getUser(userId: string) {
        const user = await getDb()
            .selectFrom('user')
            .selectAll()
            .where('userId', '=', userId)
            .executeTakeFirst();
        
        if (!user) {
            return null;
        }

        return new UserDTO(user.userId, user.username, user.hasBotStarted);
    }

    public async updateUserUsername(userId: string, newUsername: string) {
        await getDb()
            .updateTable('user')
            .set({ username: newUsername })
            .where('userId', '=', userId)
            .execute();
    }

    public async setBotStarted(userId: string, hasBotStarted: boolean) {

        console.log(hasBotStarted);

        await getDb()
            .updateTable('user')
            .set({ hasBotStarted: hasBotStarted })
            .where('userId', '=', userId)
            .execute();
    }
}
