import GroupRepository from "./group.repository";

import { AdminDTO } from "../admin/admin.dto";
import { RepoResponseStatus, ServiceResponseStatus } from "../../shared/enums";

export default class GroupServices {
    static async createGroup(groupName: string, groupId: string, adminList: number[]): Promise<ServiceResponseStatus> {

        try {

            const adminsDTOS = adminList.map((userId) => {
                const admin = new AdminDTO(userId.toString());
                return admin;
            });

            //Create group with admins
            const response = await GroupRepository.createGroup(groupId, groupName, adminsDTOS);

            switch(response) {
                case RepoResponseStatus.SUCCESS:
                    return ServiceResponseStatus.OK;
                case RepoResponseStatus.ALREADY_EXISTS:
                    return ServiceResponseStatus.ALREADY_EXISTS;
                case RepoResponseStatus.ERROR:
                    return ServiceResponseStatus.ERROR;
            }

        }
        catch(error) {
            return ServiceResponseStatus.ERROR;
        }
    }

    static async handleBotChange(oldStatus: string, newStatus: string): Promise<ServiceResponseStatus> {
        
        const isOldLeftOrKicked = oldStatus === "left" || oldStatus === "kicked";
        const isNewMemberOrAdmin = newStatus === "member" || newStatus === "administrator";

        //Bot added to the group or supergroup
        if(isOldLeftOrKicked && isNewMemberOrAdmin) {
            return ServiceResponseStatus.BOT_ADDED;
        }

        //Bot promoted to admin or kicked
        if(oldStatus === "member" && newStatus === "administrator")
            return ServiceResponseStatus.BOT_PROMOTED;
        else if(newStatus === "kicked" || newStatus === "left") {
            return ServiceResponseStatus.BOT_KICKED;
        }
    }

    static async handleMemberChange(oldStatus: string, newStatus: string): Promise<ServiceResponseStatus> {
        
        const isOldMember = oldStatus === "member";
        const isOldAdmin = oldStatus === "administrator";
        const isNewMemberOrLeftOrKicked = newStatus === "member" || newStatus === "left" || newStatus === "kicked";
        const isNewAdmin = newStatus === "administrator";

        //TODO: handle exceptions
        //Add admin
        if(isOldMember && isNewAdmin)
            return ServiceResponseStatus.ADD_ADMIN;
        
        //Remove admin
        if(isOldAdmin && isNewMemberOrLeftOrKicked)
            return ServiceResponseStatus.REMOVE_ADMIN;

        return ServiceResponseStatus.OK;
    }
    
    static async migrateGroup(oldGroupId: string, newGroupId: string) {

        const result = await GroupRepository.migrateGroup(oldGroupId, newGroupId);
        switch(result) {
            case RepoResponseStatus.SUCCESS:
                return ServiceResponseStatus.OK;
            case RepoResponseStatus.NOT_FOUND:
                return ServiceResponseStatus.NOT_FOUND;
            case RepoResponseStatus.ERROR:
                return ServiceResponseStatus.ERROR;
        }
    }

    static async toggleGroupActive(groupId: string): Promise<ServiceResponseStatus> {
        
        const response = await GroupRepository.toggleGroupActive(groupId);
        switch(response) {
            case RepoResponseStatus.SUCCESS:
                return ServiceResponseStatus.OK;
            case RepoResponseStatus.NOT_FOUND:
                return ServiceResponseStatus.NOT_FOUND;
            case RepoResponseStatus.ERROR:
                return ServiceResponseStatus.ERROR;
        }
    }

    
    static async createAdminList(groupId: string, adminList: number[]): Promise<ServiceResponseStatus> {

        const adminsDTOS = adminList.map((userId) => {
            const admin = new AdminDTO(userId.toString());
            return admin;
        });
        
        const response = await GroupRepository.createAdminList(groupId, adminsDTOS);
        switch(response) {
            case RepoResponseStatus.SUCCESS:
                return ServiceResponseStatus.OK;
            case RepoResponseStatus.NOT_FOUND:
                return ServiceResponseStatus.NOT_FOUND;
            case RepoResponseStatus.ERROR:
                return ServiceResponseStatus.ERROR;
        }
        
    }

    static async deleteAdminList(groupId: string): Promise<ServiceResponseStatus> {
        
        const response = await GroupRepository.deleteAdminList(groupId);
        switch(response) {
            case RepoResponseStatus.SUCCESS:
                return ServiceResponseStatus.OK;
            case RepoResponseStatus.NOT_FOUND:
                return ServiceResponseStatus.NOT_FOUND;
            case RepoResponseStatus.ERROR:
                return ServiceResponseStatus.ERROR;
        }
    }

    static async reloadAdminList(groupId: string, adminList: number[]): Promise<ServiceResponseStatus> {
        const adminsDTOS = adminList.map((userId) => {
            const admin = new AdminDTO(userId.toString());
            return admin;
        });
        
        const response = await GroupRepository.reloadAdminList(groupId, adminsDTOS);
        switch(response) {
            case RepoResponseStatus.SUCCESS:
                return ServiceResponseStatus.OK;
            case RepoResponseStatus.NOT_FOUND:
                return ServiceResponseStatus.NOT_FOUND;
            case RepoResponseStatus.ERROR:
                return ServiceResponseStatus.ERROR;
        }
    }
    
    static async addAdmin(groupId: string, userId: number): Promise<ServiceResponseStatus> {

        const adminDTO = new AdminDTO(userId.toString());
        
        const response = await GroupRepository.addAdmin(groupId, adminDTO);
        switch(response) {
            case RepoResponseStatus.SUCCESS:
                return ServiceResponseStatus.OK;
            case RepoResponseStatus.NOT_FOUND:
                return ServiceResponseStatus.NOT_FOUND;
            case RepoResponseStatus.ERROR:
                return ServiceResponseStatus.ERROR;
        }
    }
    
    static async removeAdmin(groupId: string, userId: number): Promise<ServiceResponseStatus> {
        const adminDTO = new AdminDTO(userId.toString());
        
        const response = await GroupRepository.removeAdmin(groupId, adminDTO);
        switch(response) {
            case RepoResponseStatus.SUCCESS:
                return ServiceResponseStatus.OK;
            case RepoResponseStatus.NOT_FOUND:
                return ServiceResponseStatus.NOT_FOUND;
            case RepoResponseStatus.ERROR:
                return ServiceResponseStatus.ERROR;
        }
    }
}

