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

	public async setActiveFlag(groupId: string, userId: number, isActive: boolean) {
		const activeResult = await this.subscriberRepository.setActiveFlag(groupId, userId.toString(), isActive);

		if(activeResult.ok === true) {
			return ok(null);
		}
		else {
			switch(activeResult.error) {
				case "DB_ERROR":
					return err("INTERNAL_ERROR");
			}
		}
		
	}
}

