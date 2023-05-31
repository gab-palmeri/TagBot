import "reflect-metadata";
import { DataSource } from "typeorm";
import { Group } from './entity/Group';
import { Tag } from './entity/Tag';
import { Subscriber } from './entity/Subscriber';
import { Admin } from './entity/Admin';
import { User } from './entity/User';
import { SubscriberTag } from './entity/SubscriberTag';

export const AppDataSource = new DataSource({
    type: "mariadb",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "tagbot",
    synchronize: process.env.ENVIRONMENT == "dev" ? true : false,
    logging: false,
    entities: [Group,Tag,Subscriber,Admin,User,SubscriberTag],
    migrations: [],
    subscribers: [],
	charset: "utf8mb4",
});
