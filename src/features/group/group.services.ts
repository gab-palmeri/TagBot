import { IGroupRepository, IGroupService } from "./group.interfaces";
import { err, ok } from "shared/result";

export default class GroupServices implements IGroupService {

    constructor(private readonly groupRepository: IGroupRepository) {}

    public async createGroup(groupName: string, groupId: string) {

        try {
            const response = await this.groupRepository.createGroup(groupId, groupName);

            if(response.ok === true) {
                return ok(null);
            }
            else {
                switch(response.error) {
                    case "ALREADY_EXISTS":
                        return err("ALREADY_EXISTS");
                    case "DB_ERROR":
                        return err("INTERNAL_ERROR");
                }
            }

        }
        catch(e) {
            return err("INTERNAL_ERROR");
        }
    }

    public async getGroup(groupID: string) {
        
        const response = await this.groupRepository.getGroup(groupID);

        if(response.ok === true) {
            return ok(response.value);
        }
        else {
            switch(response.error) {
                case "NOT_FOUND":
                    return err("NOT_FOUND");
                case "DB_ERROR":
                    return err("INTERNAL_ERROR");
            }
        }
    }

    public async handleBotChange(oldStatus: string, newStatus: string) {
        
        const isOldLeftOrKicked = oldStatus === "left" || oldStatus === "kicked";
        const isNewMemberOrAdmin = newStatus === "member" || newStatus === "administrator";

        //Bot added to the group or supergroup
        if(isOldLeftOrKicked && isNewMemberOrAdmin) {
            return ok("BOT_ADDED" as const);
        }

        //Bot promoted to admin or kicked
        if(oldStatus === "member" && newStatus === "administrator")
            return ok("BOT_PROMOTED" as const);
        else if(newStatus === "kicked" || newStatus === "left") {
            return ok("BOT_KICKED" as const);
        }

        return err("UNKNOWN_EVENT");
    }

    public async handleMemberChange(oldStatus: string, newStatus: string) {
        
        const isOldMember = oldStatus === "member";
        const isOldAdmin = oldStatus === "administrator";
        const isNewMemberOrLeftOrKicked = newStatus === "member" || newStatus === "left" || newStatus === "kicked";
        const isNewAdmin = newStatus === "administrator";

        //Add admin
        if(isOldMember && isNewAdmin)
            return ok("ADD_ADMIN" as const);
        
        //Remove admin
        if(isOldAdmin && isNewMemberOrLeftOrKicked)
            return ok("REMOVE_ADMIN" as const);

        return ok("NO_EVENT" as const);
    }
    
    public async migrateGroup(oldGroupId: string, newGroupId: string) {

        const result = await this.groupRepository.migrateGroup(oldGroupId, newGroupId);

        if(result.ok === true) {
            return ok(null);
        }
        else {
            switch(result.error) {
                case "NOT_FOUND":
                    return err("NOT_FOUND");
                case "DB_ERROR":
                    return err("INTERNAL_ERROR");
            }
        } 
    }

    public async setGroupActive(groupId: string, isActive: boolean) {
        
        const response = await this.groupRepository.setGroupActive(groupId, isActive);

        if(response.ok === true) {
            return ok(null);
        }
        else {
            switch(response.error) {
                case "NOT_FOUND":
                    return err("NOT_FOUND");
                case "DB_ERROR":
                    return err("INTERNAL_ERROR");
            }
        }
    }
}

