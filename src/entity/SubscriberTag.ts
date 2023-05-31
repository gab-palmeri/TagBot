import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm";
import { Subscriber } from "./Subscriber";
import { Tag } from "./Tag";


@Entity()
export class SubscriberTag extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    //Many to one relationship with the Subscriber entity
    @ManyToOne(() => Tag, tag => tag.subscribersTags, {onDelete: "CASCADE"})
    @JoinColumn({name: "tagId", referencedColumnName: "id"})
    tag: Tag;

    @ManyToOne(() => Subscriber, subscriber => subscriber.subscribersTags, {onDelete: "CASCADE"})
    @JoinColumn({name: "subscriberId", referencedColumnName: "id"})
    subscriber: Subscriber;

    //boolean
    @Column({type: "boolean", nullable: false, default: true})
    isActive: boolean;

}