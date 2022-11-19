import Surreal from "surrealdb.js";
import { env } from "./adapters/environment";
import { SurrealDbAdapter } from "./adapters/surrealdb";
import type { Immo } from "../../../../immo";

export class ImmoRepository {
    private constructor() {
    }

    static async create() {
        const adapter = new SurrealDbAdapter({
            namespace: "immo-stats",
            database: "immos",
            address: `${env("IMMO_DB_HOST")}:${env('IMMO_DB_PORT')}/${env('IMMO_DB_PATH')}`,
            username: env("IMMO_DB_USER"),
            password: env("IMMO_DB_PW"),
        });
        await adapter.db();
        return new ImmoRepository();
    }

    async saveAll(immos: Immo[]) {
        await Promise.all(immos.map(this.save));
    }

    async save(immo: Immo) {
       const imageRecords = await Promise.all(immo.images.map(async image => {
            await Surreal.Instance.create('image', {
                scrape: {
                    source: immo.scrape.source,
                    date: new Date(image.date).toISOString(),
                    url: image.url,
                },
                hash: image.hash,
            });
        }));

        await Surreal.Instance.create('ad', {
            scrape: {
                source: immo.scrape.source,
                date: new Date(immo.date).toISOString(),
                url: immo.scrape.url,
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
		const immos = await Surreal.Instance.select("ad");
        return immos;
    }
}
