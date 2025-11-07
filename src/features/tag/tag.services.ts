import TagRepository from './tag.repository';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default class TagServices {


	static async createTag(groupId: string, tagName: string, userId: string) {
		//create dtos and call repository
		return await TagRepository.createTag(groupId, tagName, userId);	
	}
	
	static async deleteTag(groupId: string, tagName: string) {
		
		return await TagRepository.deleteTag(groupId, tagName);
	}
	
	static async renameTag(groupId: string, oldTagName: string, newTagName: string) {
        
        oldTagName = oldTagName.startsWith("#") ? oldTagName.slice(1) : oldTagName;
        newTagName = newTagName.startsWith("#") ? newTagName.slice(1) : newTagName;

		return await TagRepository.renameTag(groupId, oldTagName, newTagName);
	}
	
    static async updateLastTagged(tagName: string, groupId: string) {

		return await TagRepository.getTag(groupId, tagName);
    }

    static async getTag(groupId: string, tagName: string) {
	
		return await TagRepository.getTag(groupId, tagName);
	}

    static async getTagSubscribers(tagName: string, groupId: string) {
		
		return await TagRepository.getSubscribersByTag(groupId, tagName);
	}

    static async getTagsByGroup(groupId: string) {
	
		return await TagRepository.getTagsByGroup(groupId);
	}
}