import { Database } from './types'; // this is the Database interface we defined earlier
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';


export const getDb = (() => {
  let dbInstance: Kysely<Database> | null = null;

  return (): Kysely<Database> => {
    if (!dbInstance) {
      console.log("Creating new DB connection pool...");
      const pool = new Pool({
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: Number(process.env.DB_PORT),
        max: 10,
      });

      dbInstance = new Kysely<Database>({
        dialect: new PostgresDialect({ pool }),
      });
    }

    return dbInstance;
  };
})();