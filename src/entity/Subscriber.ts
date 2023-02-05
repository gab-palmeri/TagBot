import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToMany } from "typeorm";
import { Tag } from "./Tag";


@Entity()
export class Subscriber extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 25, nullable: false, unique: true})
    userId: string;

    @Column({type: "varchar", length: 25, nullable: true})
    username: string;

	//many to many with notif
	@ManyToMany(() => Tag, tag => tag.subscribers, { onDelete: "CASCADE" })
	tags: Tag[];

}