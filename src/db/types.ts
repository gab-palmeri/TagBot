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
}

export interface SubscriberTable {
    userId: string; //primary key
    tagId: number; //primary key
    isActive: boolean;
}

export interface TagTable {
    id: Generated<number>; //primary key
    groupId: string;
    name: string;
    lastTagged: string;
    creatorId: string;
}

export interface GroupTable {
    groupId: string; //primary key
    groupName: string;
    canCreate: number;
    canDelete: number;
    canRename: number;
    isActive: boolean;
}

export interface AdminTable {
    userId: string; //primary key
    username: string;
    groupId: string;
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