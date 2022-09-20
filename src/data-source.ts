import "reflect-metadata";
import { DataSource } from "typeorm";
import { Group } from './entity/Group';
import { Tag } from './entity/Tag';
import { Subscriber } from './entity/Subscriber';


export const AppDataSource = new DataSource({
    type: "mariadb",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "tagbot",
    synchronize: true,
    logging: false,
    entities: [Group,Tag,Subscriber],
    migrations: [],
    subscribers: [],
});
