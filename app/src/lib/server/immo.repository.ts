import type Surreal from "surrealdb.js";
import { env } from "./adapters/environment";
import { SurrealDbAdapter } from "./adapters/surrealdb";

export class ImmoRepository {


     private dbAdapter: SurrealDbAdapter;
     private db: Surreal;
    // TODO make a singleton
     constructor() {
        this.dbAdapter = new SurrealDbAdapter({
            namespace: "immo-stats",
            database: "immos",
            address: env("IMMO_DB_ADDRESS"),
            username: env("IMMO_DB_USER"),
            password: env("IMMO_DB_PW"),
        });
    }

    async init(){
        this.db = await this.dbAdapter.db();
    } 

    async save() {
        
    }
}
