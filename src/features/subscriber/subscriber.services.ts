import { ISubscriberRepository, ISubscriberService } from './subscriber.interfaces';
import { err, ok } from 'shared/result';

export default class SubscriberServices implements ISubscriberService {

	constructor(readonly subscriberRepository: ISubscriberRepository) {}
   
	public async joinTag(groupId: string, tagName: string, userId: string) {
		
		//TODO: inserire controllo se il tag esiste
		if(process.env.NEVER === "true") {
			return err("NOT_FOUND");
		}

		//TODO: inserire controllo se l'utente è attivo (se ha avviato il bot in pvt)
		if(process.env.NEVER === "true") {
			return err("BOT_NOT_STARTED");
		}
		
		const cleanTagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;
		const joinResult = await this.subscriberRepository.joinTag(groupId, cleanTagName, userId, "");

		if(joinResult.ok === true) {
			return ok(null);
		}
		else {
			switch(joinResult.error) {
				case "ALREADY_EXISTS":
					return err("ALREADY_EXISTS");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
	}
	
	public async leaveTag(groupId: string, tagName: string, userId: string) {

		const cleanTagName = tagName.startsWith("#") ? tagName.slice(1) : tagName;

		console.log("calling repository for leaveTag", groupId, cleanTagName, userId);

		const leaveResult = await this.subscriberRepository.leaveTag(groupId, cleanTagName, userId);
		
		if(leaveResult.ok === true) {
			return ok(null);
		}
		else {
			switch(leaveResult.error) {
				case "NOT_FOUND":
					return err("NOT_FOUND");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
	}
	
	public async getSubscriberTags(userId: string, groupId: string) {
		const getSubsTagsResult = await this.subscriberRepository.getSubscriberTags(userId, groupId);

		if(getSubsTagsResult.ok === true) {

			if(getSubsTagsResult.value.length === 0) {
				return err("NOT_FOUND");
			}

			return ok(getSubsTagsResult.value.sort((a,b) => a.name.localeCompare(b.name)));
		}
		else {
			switch(getSubsTagsResult.error) {
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
	}

	public async getSubscriber(userId: string) {
		const getSubResult = await this.subscriberRepository.getSubscriber(userId);

		if(getSubResult.ok === true) {
			return ok(getSubResult.value);
		}
		else {
			switch(getSubResult.error) {
				case "NOT_FOUND":
					return err("NOT_FOUND");
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
	}

	public async updateSubscriberUsername(userId: string, username: string) {

		//TODO: inserire controllo se sub esiste

		const updateSubUsernameResult = await this.subscriberRepository.updateSubscriberUsername(userId, username);
		
		if(updateSubUsernameResult.ok === true) {
			return ok(updateSubUsernameResult.value);
		}
		else {
			switch(updateSubUsernameResult.error) {
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}	
	}

	public async setInactive(groupId: string, userId: number) {
		const inactiveResult = await this.subscriberRepository.setInactive(groupId, userId.toString());

		if(inactiveResult.ok === true) {
			ok(null);
		}
		else {
			switch(inactiveResult.error) {
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
		
	}

	public async setActive(groupId: string, userId: number) {
		const activeResult = await this.subscriberRepository.setActive(groupId, userId.toString());

		if(activeResult.ok === true) {
			ok(null);
		}
		else {
			switch(activeResult.error) {
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
		
	}
}

