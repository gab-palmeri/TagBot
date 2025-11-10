import { IUserRepository } from "./user.interfaces";
import { ok, err } from "shared/result";

import { db } from "@db/database";

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

    public async getUserId(userId: string) {
        try {
            const user = await db
                .selectFrom('user')
                .selectAll()
                .where('userId', '=', userId)
                .executeTakeFirst();
            
            if (!user) {
                return err("NOT_FOUND");
            }

            return ok(user.userId);
        }
        catch(e) {
            console.log(`Error fetching user with id: ${userId}`, e);
            return err("DB_ERROR");
        }
    }
}