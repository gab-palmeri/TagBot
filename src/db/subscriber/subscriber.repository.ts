import { TagDTO } from '../../db/tag/tag.dto';
import { ISubscriberRepository } from './subscriber.interfaces';
import { getDb } from '@db/database';

export default class SubscriberRepository implements ISubscriberRepository {
   
    public async joinTag(group_id: number, tagName: string, userId: string) {
        const tag = await getDb()
            .selectFrom('tag')
            .selectAll()
            .where('name', '=', tagName)
            .where('group_id', '=', group_id)
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
    
    public async leaveTag(group_id: number, tagName: string, userId: string) {
        await getDb()
            .deleteFrom('subscriber')
            .using('tag')
            .whereRef('subscriber.tagId', '=', 'tag.id')
            .where('subscriber.userId', '=', userId)
            .where('tag.name', '=', tagName)
            .where('tag.group_id', '=', group_id)
            .execute();

    }
    
    //TODO: Valutare se spostare il metodo in Tags con un metodo getBySubscriber
    public async getSubscriberTags(userId: string, group_id: number) {
        
        const tags = await getDb()
            .selectFrom('tag')
            .innerJoin('subscriber', 'subscriber.tagId', 'tag.id')
            .where('subscriber.userId', '=', userId) // solo tag a cui l'utente è iscritto
            .where('tag.group_id', '=', group_id)
            .innerJoin('subscriber as subAll', 'subAll.tagId', 'tag.id')
            .select([
                'tag.name',
                'tag.creatorId as creatorId',
                'tag.lastTagged as lastTagged',
                (eb) => eb.fn.count('subAll.userId').as('subscribersNum')
            ])            
            .groupBy(['tag.id', 'tag.name', 'tag.creatorId', 'tag.lastTagged'])
            .execute();

        return tags.map(tag => new TagDTO(
            tag.name,
            tag.creatorId,
            tag.lastTagged,
            Number(tag.subscribersNum)
        ));
    }

    public async setActiveFlag(group_id: number, userId: string, isActive: boolean) {
        const groupTags = await getDb()
            .selectFrom('tag')
            .selectAll()
            .where('group_id', '=', group_id)
            .execute();

        await getDb()
            .updateTable('subscriber')
            .set({ isActive: isActive })
            .where('userId', '=', userId)
            .where('tagId', 'in', groupTags.map(t => t.id))
            .execute();
    }

    public async isSubscribedToTag(group_id: number, tagName: string, userId: string) {
        const subscriber = await getDb()
            .selectFrom('subscriber')
            .innerJoin('tag', 'subscriber.tagId', 'tag.id')
            .selectAll()
            .where('subscriber.userId', '=', userId)
            .where('tag.name', '=', tagName)
            .where('tag.group_id', '=', group_id)
            .executeTakeFirst();

        return subscriber ? true : false;
    }
}
