import type Surreal from "surrealdb.js";
import { env } from "./adapters/environment";
import { SurrealDbAdapter } from "./adapters/surrealdb";
import type { Immo } from "../../../../immo.ts";

export class ImmoRepository {

    private db: Surreal;

    private constructor() {
        this.db = Surreal.Instance;
    }

    static async create() {
        const adapter = new SurrealDbAdapter({
            namespace: "immo-stats",
            database: "immos",
            address: env("IMMO_DB_ADDRESS"),
            username: env("IMMO_DB_USER"),
            password: env("IMMO_DB_PW"),
        });
        await dbAdapter.db();
        return new ImmoRepository();
    }

    async saveAll(immos: Immo[]) {
        await Promise.all(immos.map(this.save));
    }

    async save(immo: Immo) {
       const imageRecords = await Promise.all(immo.images.map(image => {
            await this.db.create('image', {
                scrape: {
                    source: immo.source,
                    date: new Date(image.date).toISOString(),
                    url: image.url,
                },
                hash: image.hash,
            });
        }));

        await this.db.create('ad', {
            scrape: {
                source: immo.source,
                date: new Date(immo.date).toISOString(),
                url: immo.url,
            },
            title: immo.title, 
            price: immo.price, 
            date: immo.date, 
            address: immo.address, 
            livingQm: immo.livingQm, 
            propertyQm: immo.propertyQm, 
            text: immo.text,
            images: imageRecords
        });
    }

    async loadAll() {
		const immos = await db.select("ad");
        return immos;
    }
}
