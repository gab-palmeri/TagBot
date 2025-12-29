import { TagDTO } from '../tag/tag.dto';
import { ISubscriberRepository } from './subscriber.interfaces';
import { err, ok } from 'shared/result';

import { db } from '@db/database';

export default class SubscriberRepository implements ISubscriberRepository {
   
    //TODO: rimosso il controllo se il tag esiste, bisogna metterlo altrove a monte
    public async joinTag(groupId: string, tagName: string, userId: string) {
        try {

            const tag = await db.
                selectFrom('tag')
                .selectAll()
                .where('name', '=', tagName)
                .where('groupId', '=', groupId)
                .select('id')
                .executeTakeFirst();
            
            //TODO: farlo fuori Check if the user is already subscribed to the tag
            const existingSubscriber = await db
                .selectFrom('subscriber')
                .selectAll()
                .where('userId', '=', userId)
                .where('tagId', '=', tag.id)
                .executeTakeFirst();

            if (!existingSubscriber) {
                await db.insertInto('subscriber')
                    .values({
                        userId: userId,
                        tagId: tag.id,
                        isActive: true
                    })
                    .execute();
                return ok(null);
            } else {
                return err("ALREADY_EXISTS");
            }

        } catch (e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
    
    public async leaveTag(groupId: string, tagName: string, userId: string) {
        
        try {
            const tag = await db
                .selectFrom('tag')
                .selectAll()
                .where('name', '=', tagName)
                .where('groupId', '=', groupId)
                .select('id')
                .executeTakeFirst();

            if(!tag) {
                return err("NOT_FOUND");
            }

            const subscriber = await db
                .selectFrom('subscriber')
                .selectAll()
                .where('userId', '=', userId)
                .where('tagId', '=', tag.id)
                .executeTakeFirst();
    
            if(!subscriber) {
                return err("NOT_FOUND");
            }

            await db
                .deleteFrom('subscriber')
                .where('userId', '=', userId)
                .where('tagId', '=', tag.id)
                .execute();

            return ok(null);
        }
        catch(e) {
            console.log(err);
            return err("DB_ERROR");
        }
    }
    
    public async getSubscriberTags(userId: string, groupId: string) {
        try {
            const tags = await db
                .selectFrom('subscriber')
                .innerJoin('tag', 'subscriber.tagId', 'tag.id')
                .select([
                    'tag.name',
                    'tag.creatorId',
                    'tag.lastTagged'
                ])
                .where('subscriber.userId', '=', userId)
                .where('tag.groupId', '=', groupId)
                .execute();
            
            const tagsDTOS = tags.map(tag => new TagDTO(
                tag.name,
                tag.creatorId,
                tag.lastTagged
            ));

            return ok(tagsDTOS);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async setActiveFlag(groupId: string, userId: string, isActive: boolean) {
        try {

            const groupTags = await db
                .selectFrom('tag')
                .selectAll()
                .where('groupId', '=', groupId)
                .execute();

            await db
                .updateTable('subscriber')
                .set({ isActive: isActive })
                .where('userId', '=', userId)
                .where('tagId', 'in', groupTags.map(t => t.id))
                .execute();

            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
}