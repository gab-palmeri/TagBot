import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { TagDTO } from './tag.dto';
import { ITagRepository, ITagService } from './tag.interfaces';
import { err, ok } from 'shared/result';

dayjs.extend(utc);

export default class TagServices implements ITagService {

	constructor(readonly tagRepository: ITagRepository) {}

	public async createTag(groupId: string, tagName: string, userId: string) {

		tagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;
		const regex = /^(?=[^A-Za-z]*[A-Za-z])[#]{0,1}[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;
		if(!regex.test(tagName)) 
			return err("INVALID_SYNTAX");

		const createResult = await this.tagRepository.createTag(groupId, tagName, userId);

		if(createResult.ok === true) {
			return ok(null);
		}
		else {
			switch(createResult.error) {
				case "ALREADY_EXISTS":
					return err("ALREADY_EXISTS");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
	}
	
	public async deleteTag(groupId: string, tagName: string) {
		const deleteResult =  await this.tagRepository.deleteTag(groupId, tagName);

		if(deleteResult.ok === true) {
			return ok(null);
		}
		else {
			switch(deleteResult.error) {
				case "NOT_FOUND":
					return err("NOT_FOUND");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
		
	}
	
	public async renameTag(groupId: string, oldTagName: string, newTagName: string) {
        
        oldTagName = oldTagName.startsWith("#") ? oldTagName.slice(1) : oldTagName;
        newTagName = newTagName.startsWith("#") ? newTagName.slice(1) : newTagName;

		const regex = /^(?=[^A-Za-z]*[A-Za-z])[#]{0,1}[a-zA-Z0-9][a-zA-Z0-9_]{2,31}$/;
		if(!regex.test(oldTagName) || !regex.test(newTagName)) 
			return err("INVALID_SYNTAX");

		const renameResult = await this.tagRepository.renameTag(groupId, oldTagName, newTagName);

		if(renameResult.ok === true) {
			return ok(null);
		}
		else {
			switch(renameResult.error) {
				case "NOT_FOUND":
					return err("NOT_FOUND");
				case "ALREADY_EXISTS":
					return err("ALREADY_EXISTS");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
		
	}
	
    public async updateLastTagged(tagName: string, groupId: string) {
		const updateLastTaggedResult = await this.tagRepository.updateLastTagged(groupId, tagName);

		if(updateLastTaggedResult.ok === true) {
			return ok(null);
		}
		else {
			switch(updateLastTaggedResult.error) {
				case "NOT_FOUND":
					return err("NOT_FOUND");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
		
    }

    public async getTag(groupId: string, tagName: string) {
		const getTagResult = await this.tagRepository.getTag(groupId, tagName);

		if(getTagResult.ok === true) {
			return ok(getTagResult.value);
		}
		else {
			switch(getTagResult.error) {
				case "NOT_FOUND":
					return err("NOT_FOUND");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
	}

    public async getTagSubscribers(tagName: string, groupId: string) {

		tagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;

		const getTagSubscribersResult = await this.tagRepository.getSubscribersByTag(tagName, groupId);

		if(getTagSubscribersResult.ok === true) {
			return ok(getTagSubscribersResult.value);
		}
		else {
			switch(getTagSubscribersResult.error) {
				case "NOT_FOUND":
					return err("NOT_FOUND");
				case "NO_CONTENT":
					return err("NO_CONTENT");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
	}

	//TODO: better typing of the response
    public async getTagsByGroup(groupId: string) {
		const getTagsByGroupResult = await this.tagRepository.getTagsByGroup(groupId);

		//check if response is of type RepoResponseStatus
		if(getTagsByGroupResult.ok === false) {
			switch(getTagsByGroupResult.error) {
				case "NOT_FOUND":
					return err("NOT_FOUND");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}

		const tags = getTagsByGroupResult.value;
		const maxActiveTags = 5; 
		const maxNextTags = 5; 
	
		// If there are more than 5 tags, sort them by score
		if(tags.length > maxActiveTags) {
			//Calculate the maximum number of subscribers among all the tags
			const maxSubscribers = tags.reduce((max, tag) => tag.subscribersNum > max ? tag.subscribersNum : max, 0);
	
			//Calculate the score for each tag
			const tagsWithScores = tags.map(tag => {
				//1) Score based on the number of subscribers: the more subscribers, the higher the score
				const subscribersScore = tag.subscribersNum / maxSubscribers;
	
				//2) Score based on the last time the tag was used: the more recent, the higher the score
				//   Calculate the distance between today and tagLastTagged in days    
				const tagLastTagged = new Date(tag.lastTagged);
				const diffTime = Math.abs(new Date().getTime() - tagLastTagged.getTime());
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				const dateScore = 1 / diffDays;
	
				return { tag, score: subscribersScore + dateScore };
			});
	
			// Sort the tags by score
			const tagsByScore = tagsWithScores.sort((a,b) => b.score - a.score).map(tag => tag.tag);
	
			// Take the first 5 tags with the highest score, and then all the others
			const mostActiveTags = tagsByScore.slice(0, maxActiveTags)
												.sort((a,b) => a.name.localeCompare(b.name))
												.map(tag => new TagDTO(tag.name, tag.creatorId, tag.lastTagged, tag.subscribersNum));
			const nextTags = tagsByScore.slice(maxActiveTags, maxActiveTags + maxNextTags)
										.sort((a,b) => a.name.localeCompare(b.name))
										.map(tag => new TagDTO(tag.name, tag.creatorId, tag.lastTagged, tag.subscribersNum));

			return ok({
				"mainTags": mostActiveTags,
				"secondaryTags": nextTags
			});
			

		}
		else {
			// If there are less than 5 tags, sort them alphabetically and send them
			const tagsByName = tags.sort((a,b) => a.name.localeCompare(b.name));
			return ok({
				"mainTags": tagsByName,
				"secondaryTags": null
			});
		}
	}

}