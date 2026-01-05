import {
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely';

export interface Database {
    user: UserTable;
    subscriber: SubscriberTable;  
    tag: TagTable;
    group: GroupTable;
    admin: AdminTable;
}

export interface UserTable {
    userId: string; //primary key
    username: string;
    hasBotStarted: boolean;
    lang: string;
}

export interface SubscriberTable {
    userId: string; //primary key
    tagId: number; //primary key
    isActive: boolean;
}

export interface TagTable {
    id: Generated<number>; //primary key
    group_id: number;
    name: string;
    lastTagged: string;
    creatorId: string;
}

export interface GroupTable {
    id: Generated<number>; //primary key
    groupId: string; 
    groupName: string;
    canCreate: number;
    canDelete: number;
    canRename: number;
    isActive: boolean;
    lang: string;
}

export interface AdminTable {
    userId: string; //primary key
    group_id: number;
}

export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UserUpdate = Updateable<UserTable>

export type Subscriber = Selectable<SubscriberTable>
export type NewSubscriber = Insertable<SubscriberTable>
export type SubscriberUpdate = Updateable<SubscriberTable>

export type Tag = Selectable<TagTable>
export type NewTag = Insertable<TagTable>
export type TagUpdate = Updateable<TagTable>

export type Group = Selectable<GroupTable>
export type NewGroup = Insertable<GroupTable>
export type GroupUpdate = Updateable<GroupTable>

export type Admin = Selectable<AdminTable>
export type NewAdmin = Insertable<AdminTable>
export type AdminUpdate = Updateable<AdminTable>