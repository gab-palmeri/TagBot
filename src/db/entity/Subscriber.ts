import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from "typeorm";
import { SubscriberTag } from "./SubscriberTag";


@Entity()
export class Subscriber extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 25, nullable: false, unique: true})
    userId: string;

    @Column({type: "varchar", length: 25, nullable: true})
    username: string;

	//many to many with notif
	@OneToMany(() => SubscriberTag, st => st.subscriber, {cascade: ["insert", "remove"]})
	subscribersTags: SubscriberTag[];

}