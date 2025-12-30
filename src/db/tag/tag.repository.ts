import { SubscriberDTO } from "db/subscriber/subscriber.dto";
import { ITagRepository } from "./tag.interfaces";
import { err, ok } from "@utils/result";

import { db } from "@db/database";
import { TagDTO } from "./tag.dto";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export default class TagRepository implements ITagRepository {

    //TODO: controllo se il gruppo esiste farlo a monte
    public async create(groupId: string, tagName: string, userId: string) {
        try {
            await db
                .insertInto('tag')
                .values({
                    name: tagName.toLowerCase(),
                    creatorId: userId,
                    groupId: groupId,
                    lastTagged: dayjs.utc().format(),
                })
                .execute();

            return ok(null);
        }
        catch(e) {
            if(e.code === '23505') {
                return err("ALREADY_EXISTS");
            }
            else {
                console.log(e);
                return err("DB_ERROR");
            }
        }
    }
    
    public async delete(groupId: string, tagName: string) {
        try {
            //use kysely
            const tag = await db
                .selectFrom('tag')
                .where('name', '=', tagName)
                .where('groupId', '=', groupId)
                .selectAll()
                .executeTakeFirst();
    
            if(!tag) {
                return err("NOT_FOUND");
            }
    
            await db.deleteFrom('tag')
                .where('id', '=', tag.id)
                .execute();
            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
    
    public async rename(groupId: string, oldTagName: string, newTagName: string) {
        try {


            const tag = await db
                .selectFrom('tag')
                .where('name', '=', oldTagName)
                .where('groupId', '=', groupId)
                .selectAll()
                .executeTakeFirst();
    
            if(!tag) {
                return err("NOT_FOUND");
            }
    
            tag.name = newTagName;
            await db.updateTable('tag')
                .set({ name: newTagName })
                .where('id', '=', tag.id)
                .execute();
            
            return ok(null);
        }
        catch(e) {
            if(e.code == "23505")
                return err("ALREADY_EXISTS");
            else {
                return err("DB_ERROR");
            }
        }
    }

    public async updateLastTagged(groupId: string, tagName: string) {
        try {
            const result = await db
                .updateTable('tag')
                .set({ lastTagged: dayjs.utc().toISOString() })
                .where('name', '=', tagName)
                .where('groupId', '=', groupId)
                .executeTakeFirst();

            // executeTakeFirst() returns undefined if no rows were updated
            if (!result || Number(result.numUpdatedRows) === 0) {
                return err('NOT_FOUND');
            }

            return ok(null);

        } catch (e) {
            console.log(e);
            return err('DB_ERROR');
        }
    }

    public async get(groupId: string, tagName: string) {
        try {

            const tag = await db
                .selectFrom('tag')
                .where('name', '=', tagName)
                .where('groupId', '=', groupId)
                .selectAll()
                .executeTakeFirst();
    
            if(!tag) {
                return err("NOT_FOUND");
            }
            
            const foundTagDTO = new TagDTO(
                tag.name,
                tag.creatorId,
                tag.lastTagged
            );
            
            return ok(foundTagDTO);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async getSubscribers(tagName: string, groupId: string) {
        try {
            
            //get all subscribers for the given tag. the username is taken from the user table
            const subscribersTags = await db
                .selectFrom('subscriber')
                .innerJoin('tag', 'subscriber.tagId', 'tag.id')
                .innerJoin('user', 'subscriber.userId', 'user.userId')
                .where('tag.name', '=', tagName)
                .where('tag.groupId', '=', groupId)
                .select([
                    'subscriber.userId as userId',
                    'user.username as username'
                ])
                .execute();
    
            const subscribers = subscribersTags.map(st => { 
                return new SubscriberDTO(
                    st.userId,
                    st.username
                );
            });

            return ok(subscribers);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async getByGroup(groupId: string) {
        try {

            const tags = await db
                .selectFrom('tag')
                .leftJoin('subscriber', 'tag.id', 'subscriber.tagId')
                .where('tag.groupId', '=', groupId)
                .select([
                    'tag.name',
                    'tag.creatorId as creatorId',
                    'tag.lastTagged as lastTagged',
                    db.fn.count('subscriber.userId').as('subscriberCount')
                ])
                .groupBy(['tag.name', 'tag.creatorId', 'tag.lastTagged'])
                .execute();
    
            const tagDTOs = tags.map(t => {
                return new TagDTO(
                    t.name,
                    t.creatorId,
                    t.lastTagged,
                    Number(t.subscriberCount)
                );
            });
    
            return ok(tagDTOs);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
}