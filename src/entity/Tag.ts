import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, Unique, OneToMany } from "typeorm";
import { Group } from "./Group";
import { SubscriberTag } from "./SubscriberTag";


@Entity()
@Unique(['name', 'group'])
export class Tag extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 25, nullable: false })
    name: string;

    @Column({type: 'datetime', nullable: true})
    lastTagged: Date;

    @Column({type: 'varchar', length: 25, nullable: false, default: '0'})
    creatorId: number;

    @ManyToOne(() => Group, (group) => group.tags, { onDelete: 'CASCADE' })
    group: Group;

    //many to many with subscriber
    @OneToMany(() => SubscriberTag, st => st.tag, { cascade: true })
    subscribersTags: SubscriberTag[];
}