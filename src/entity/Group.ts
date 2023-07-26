import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from "typeorm";
import { Admin } from "./Admin";
import { Tag } from "./Tag";


@Entity()
export class Group extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", nullable:true})
    groupName: string;

    @Column({type: "varchar", length: 25, nullable: false, unique: true})
    groupId: number;

    @Column({type: "smallint", nullable: false, default: 0})
    canCreate: number;

    @Column({type: "smallint", nullable: false, default: 0})
    canDelete: number;

    @Column({type: "smallint", nullable: false, default: 0})
    canRename: number;

    @Column({type: "smallint", nullable: false, default: 0})
    canAddUsers: number;

    @Column({type: "smallint", nullable: false, default: 0})
    canRemUsers: number;

	@Column({type: "boolean", nullable: false, default: false})
    isActive: boolean;


	@OneToMany(() => Tag, tag => tag.group)
	tags: Tag[];

    @OneToMany(() => Admin, admin => admin.group)
    admins: Admin[];

}