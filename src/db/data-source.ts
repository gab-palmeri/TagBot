import "reflect-metadata";
import { DataSource } from "typeorm";
import { Group } from '@db/entity/Group';
import { Tag } from '@db/entity/Tag';
import { Subscriber } from '@db/entity/Subscriber';
import { Admin } from '@db/entity/Admin';
import { User } from '@db/entity/User';
import { SubscriberTag } from '@db/entity/SubscriberTag';


const socketPath = process.env.ENVIRONMENT == "prod" ? { socketPath: process.env.DB_HOST } : undefined;

export const AppDataSource = new DataSource({
    type: "mysql",
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
    timezone: "Z",
    extra: socketPath
});
