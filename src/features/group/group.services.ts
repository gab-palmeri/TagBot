import { IGroupRepository, IGroupService } from "./group.interfaces";
import { err, ok } from "shared/result";

export default class GroupServices implements IGroupService {

    constructor(private readonly groupRepository: IGroupRepository) {}

    public async createGroup(groupName: string, groupId: string, adminIDs: string[]) {

        try {
            const response = await this.groupRepository.createGroup(groupId, groupName, adminIDs);

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

        //TODO: handle exceptions
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

    public async toggleGroupActive(groupId: string) {
        
        const response = await this.groupRepository.toggleGroupActive(groupId);

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

    
    public async createAdminList(groupId: string, adminIDs: string[]) {
        
        const response = await this.groupRepository.createAdminList(groupId, adminIDs);

        if(response.ok === true) {
            return ok(null);
        }
        else {
            switch(response.error) {
                case "DB_ERROR":
                    return err("INTERNAL_ERROR");
            }
        }
        
    }

    public async deleteAdminList(groupId: string) {
        
        const response = await this.groupRepository.deleteAdminList(groupId);

        if(response.ok === true) {
            return ok(null);
        }
        else {
            switch(response.error) {
                case "DB_ERROR":
                    return err("INTERNAL_ERROR");
            }
        }
    }

    //TODO: aggiungere controllo se il gruppo esiste, così come in createAdminList e deleteAdminList
    public async reloadAdminList(groupId: string, adminIDs: string[]) {
        
        const response = await this.groupRepository.reloadAdminList(groupId, adminIDs);

        if(response.ok === true) {
            return ok(null);
        }
        else {
            switch(response.error) {
                case "DB_ERROR":
                    return err("INTERNAL_ERROR");
            }
        }
    }
    
    public async addAdmin(groupId: string, userID: string) {

        const response = await this.groupRepository.addAdmin(groupId, userID);

        if(response.ok === true) {
            return ok(null);
        }
        else {
            switch(response.error) {
                case "DB_ERROR":
                    return err("INTERNAL_ERROR");
            }
        }
    }
    
    public async removeAdmin(groupId: string, userId: string) {
        
        const response = await this.groupRepository.removeAdmin(groupId, userId);

        if(response.ok === true) {
            return ok(null);
        }
        else {
            switch(response.error) {
                case "DB_ERROR":
                    return err("INTERNAL_ERROR");
            }
        }
    }
}

