import { IUserRepository } from "./user.interfaces";
import { getDb } from 'db/database';
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

        return new UserDTO(user.userId, user.username, user.hasBotStarted, user.lang);
    }

    public async update(userId: string, data: Partial<Pick<UserDTO, "username" | "hasBotStarted" | "lang">>): Promise<void> {
        await getDb()
            .updateTable('user')
            .set(data)
            .where('userId', '=', userId)
            .execute();
    }

    public async getAllActiveUsers() {
        const users = await getDb()
            .selectFrom('user')
            .selectAll()
            .where('hasBotStarted', '=', true)
            .execute();
        return users.map(user => new UserDTO(user.userId, user.username, user.hasBotStarted, user.lang));
    }
}
