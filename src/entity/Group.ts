import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from "typeorm";
import { Admin } from "./Admin";
import { Tag } from "./Tag";


@Entity()
export class Group extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 25, nullable: false, unique: true})
    groupId: number;

	//ONE TO MANY with Notif
	@OneToMany(() => Tag, tag => tag.group, {onDelete: "CASCADE"})
	tags: Tag[];

    @OneToMany(() => Admin, admin => admin.groups, {onDelete: "CASCADE", cascade: true, orphanedRowAction: "delete"})
    admins: Admin[];

}