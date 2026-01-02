import { TagDTO } from '../../db/tag/tag.dto';
import { ISubscriberRepository } from './subscriber.interfaces';
import { getDb } from '@db/database';

export default class SubscriberRepository implements ISubscriberRepository {
   
    public async joinTag(groupId: string, tagName: string, userId: string) {
        const tag = await getDb()
            .selectFrom('tag')
            .selectAll()
            .where('name', '=', tagName)
            .where('groupId', '=', groupId)
            .select('id')
            .executeTakeFirst();
        
        await getDb().insertInto('subscriber')
            .values({
                userId: userId,
                tagId: tag.id,
                isActive: true
            })
            .execute();
    }
    
    public async leaveTag(groupId: string, tagName: string, userId: string) {
        await getDb()
            .deleteFrom('subscriber')
            .innerJoin('tag', 'subscriber.tagId', 'tag.id')
            .where('userId', '=', userId)
            .where('tag.name', '=', tagName)
            .where('tag.groupId', '=', groupId)
            .execute();
    }
    
    public async getSubscriberTags(userId: string, groupId: string) {
        const tags = await getDb()
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

        return tagsDTOS;
    }

    public async setActiveFlag(groupId: string, userId: string, isActive: boolean) {
        const groupTags = await getDb()
            .selectFrom('tag')
            .selectAll()
            .where('groupId', '=', groupId)
            .execute();

        await getDb()
            .updateTable('subscriber')
            .set({ isActive: isActive })
            .where('userId', '=', userId)
            .where('tagId', 'in', groupTags.map(t => t.id))
            .execute();
    }

    public async isSubscribedToTag(groupId: string, tagName: string, userId: string) {
        const subscriber = await getDb()
            .selectFrom('subscriber')
            .innerJoin('tag', 'subscriber.tagId', 'tag.id')
            .selectAll()
            .where('subscriber.userId', '=', userId)
            .where('tag.name', '=', tagName)
            .where('tag.groupId', '=', groupId)
            .executeTakeFirst();

        return subscriber ? true : false;
    }
}
