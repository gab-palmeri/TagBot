import { SubscriberDTO } from "db/subscriber/subscriber.dto";
import { ITagRepository } from "./tag.interfaces";

import { getDb } from '@db/database';
import { TagDTO } from "./tag.dto";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export default class TagRepository implements ITagRepository {

    public async create(group_id: number, tagName: string, userId: string) {
        await getDb()
            .insertInto('tag')
            .values({
                name: tagName.toLowerCase(),
                creatorId: userId,
                group_id: group_id,
                lastTagged: dayjs.utc().format(),
            })
            .execute();
    }
    
    public async delete(group_id: number, tagName: string) {
        await getDb()
            .deleteFrom('tag')
            .where('tag.name', '=', tagName)
            .where('tag.group_id', '=', group_id)
            .execute();
    }
    
    public async rename(group_id: number, oldTagName: string, newTagName: string) {
        await getDb().updateTable('tag')
            .set({ name: newTagName })
            .where('name', '=', oldTagName)
            .where('group_id', '=', group_id)
            .execute();
    }

    public async updateLastTagged(group_id: number, tagName: string) {
        await getDb()
            .updateTable('tag')
            .set({ lastTagged: dayjs.utc().toISOString() })
            .where('name', '=', tagName)
            .where('group_id', '=', group_id)
            .execute();
    }

    public async get(group_id: number, tagName: string) {
        const tag = await getDb()
            .selectFrom('tag')
            .where('name', '=', tagName)
            .where('group_id', '=', group_id)
            .selectAll()
            .executeTakeFirst();

        if(!tag) {
            return null;
        }
        
        const foundTagDTO = new TagDTO(
            tag.name,
            tag.creatorId,
            tag.lastTagged
        );
        
        return foundTagDTO;
    }

    public async getSubscribers(group_id: number, tagName: string) {
        const subscribersTags = await getDb()
            .selectFrom('subscriber')
            .innerJoin('tag', 'subscriber.tagId', 'tag.id')
            .innerJoin('user', 'subscriber.userId', 'user.userId')
            .where('tag.name', '=', tagName)
            .where('tag.group_id', '=', group_id)
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

        return subscribers;
    }

    public async getByGroup(group_id: number) {
        const tags = await getDb()
            .selectFrom('tag')
            .leftJoin('subscriber', 'tag.id', 'subscriber.tagId')
            .where('tag.group_id', '=', group_id)
            .select([
                'tag.name',
                'tag.creatorId as creatorId',
                'tag.lastTagged as lastTagged',
                getDb().fn.count('subscriber.userId').as('subscriberCount')
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

        return tagDTOs;
    }
}