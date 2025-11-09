import { Tag } from '@db/entity/Tag';
import { Subscriber } from '@db/entity/Subscriber';
import { SubscriberTag } from '@db/entity/SubscriberTag';
import { SubscriberDTO } from 'features/subscriber/subscriber.dto';
import { TagDTO } from '../tag/tag.dto';
import { ISubscriberRepository } from './subscriber.interfaces';
import { err, ok } from 'shared/result';

export default class SubscriberRepository implements ISubscriberRepository {
   
    //TODO: rimosso il controllo se il tag esiste, bisogna metterlo altrove a monte
    public async joinTag(groupId: string, tagName: string, userId: string, username: string) {
        
        const tag = await Tag.findOne({
            where: {
                name: tagName, 
                group: {groupId: groupId}
            }, 
            relations: ["group", "subscribersTags"]
        });
            
        try {
            let subscriber = await Subscriber.findOne({
                where: { userId: userId },
                relations: ["subscribersTags", "subscribersTags.tag"]
            });
    
            if(!subscriber) {
                subscriber = new Subscriber();
                subscriber.userId = userId;
                subscriber.username = username;

                const subscribersTags = new SubscriberTag();
                subscribersTags.subscriber = subscriber;
                subscribersTags.tag = tag;
                subscriber.subscribersTags = [subscribersTags];

                subscriber = await subscriber.save();
            }
            else {
                if(subscriber.subscribersTags.find(n => n.tag.id == tag.id))
                    return err("ALREADY_EXISTS");
    
                const subscribersTags = new SubscriberTag();
                subscribersTags.subscriber = subscriber;
                subscribersTags.tag = tag;

                subscriber.subscribersTags.push(subscribersTags);
                await subscriber.save();
            }
    
            return ok(null);
        }
        catch(e) {
            console.log(err);
            return err("DB_ERROR");
        }
    }
    
    public async leaveTag(groupId: string, tagName: string, userId: string) {
        
        const tag = await Tag.findOne({
            where: {
                name: tagName, 
                group: {groupId: groupId}
            }, 
            relations: ["group", "subscribersTags"]
        });

        if(!tag) {
            return err("NOT_FOUND");
        }
    
        try {
            const subscriber = await Subscriber.findOne({
                relations: ["subscribersTags", "subscribersTags.tag"], 
                where: { userId: userId }
            });
    
            if(!subscriber?.subscribersTags.find(n => n.tag.id == tag.id)) {
                return err("NOT_FOUND");
            }

            await subscriber.subscribersTags.find(n => n.tag.id == tag.id).remove();
            subscriber.subscribersTags = subscriber.subscribersTags.filter(n => n.tag.id != tag.id);
            await subscriber.save();
    
            return ok(null);
        }
        catch(e) {
            console.log(err);
            return err("DB_ERROR");
        }
    }
    
    public async getSubscriberTags(userId: string, groupId: string) {
        try {
            const tags = await Tag.find({
                relations: ["group", "subscribersTags", "subscribersTags.subscriber"], 
                where: {
                    group: { groupId: groupId },
                    subscribersTags: { subscriber: { userId: userId } }
                }
            });
            
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
    
    public async getSubscriber(userId: string) {
        try {
            const subscriber = await Subscriber.findOne({
                where: { userId: userId }
            });
    
            if(!subscriber) {
                return err("NOT_FOUND");
            }
            
            const subscriberDTO = new SubscriberDTO(
                subscriber.userId,
                subscriber.username
            );

            return ok(subscriberDTO);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    //TODO: rimosso il controllo se il subscriber esiste, inserirlo a monte
    public async updateSubscriberUsername(userId: string, username: string) {
        try {
            const subscriber = await Subscriber.findOne({
                where: { userId: userId }
            });
            
            subscriber.username = username;
            await subscriber.save();
            
            const subscriberDTO = new SubscriberDTO(
                subscriber.userId,
                subscriber.username
            );

            return ok(subscriberDTO);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async setInactive(groupId: string, userId: string) {
        try {
            const subscriberTags = await SubscriberTag.find({
                relations: ["subscriber", "tag"], 
                where: {
                    subscriber: { userId: userId },
                    tag: { group: { groupId: groupId } }
                }
            });

            await Promise.all(subscriberTags.map(st => {
                st.isActive = false;
                return st.save();
            }));

            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }

    public async setActive(groupId: string, userId: string) {
        try {
            const subscriberTags = await SubscriberTag.find({
                relations: ["subscriber", "tag"], 
                where: {
                    subscriber: { userId: userId },
                    tag: { group: { groupId: groupId } }
                }
            });

            await Promise.all(subscriberTags.map(st => {
                st.isActive = true;
                return st.save();
            }));

            return ok(null);
        }
        catch(e) {
            console.log(e);
            return err("DB_ERROR");
        }
    }
}