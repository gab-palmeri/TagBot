import { IUserRepository } from "./user.interfaces";
import { ok, err } from "shared/result";

import { db } from "@db/database";
import { UserDTO } from "./user.dto";

export default class UserRepository implements IUserRepository {
    
    public async saveUser(userId: string, username: string) {
        try {
            
            //save user with kysely and db
            await db.insertInto('user').values({ userId: userId.toString(), username: username }).execute();
            return ok(null);
        }
        catch(e) {
            console.log(`User with id: ${userId} already exists (expected in normal operation)`);
            return err("ALREADY_EXISTS");
        }
    }

    public async deleteUser(userId: string)  {
        try {
            await db.deleteFrom('user').where('userId', '=', userId).execute();
            return ok(null);
        }
        catch(e) {
            console.log(`Failed to delete user with id: ${userId}`, e);
            return err("DB_ERROR");
        }
    }

    public async userExists(userId: string) {
        try {
            const user = await db.selectFrom('user').selectAll().where('userId', '=', userId).executeTakeFirst();
            return ok(user != null);
        }
        catch(e) {
            console.log(`Error checking user existence for id: ${userId}`, e);
            return err("DB_ERROR");
        }
    }

    public async getUser(userId: string) {
        try {
            const user = await db
                .selectFrom('user')
                .selectAll()
                .where('userId', '=', userId)
                .executeTakeFirst();
            
            if (!user) {
                return err("NOT_FOUND");
            }

            return ok(new UserDTO(user.userId, user.username));
        }
        catch(e) {
            console.log(`Error fetching user with id: ${userId}`, e);
            return err("DB_ERROR");
        }
    }

    public async updateUserUsername(userId: string, newUsername: string) {
        try {
            await db
                .updateTable('user')
                .set({ username: newUsername })
                .where('userId', '=', userId)
                .execute();
            return ok(null);
        }
        catch(e) {
            console.log(`Error updating username for user with id: ${userId}`, e);
            return err("DB_ERROR");
        }
    }
}