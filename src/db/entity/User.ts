import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";


//This entity represents a PRIVATE user of the bot
@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 25, nullable: false, unique: true})
    userId: string;

}