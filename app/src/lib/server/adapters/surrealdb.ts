import Surreal from 'surrealdb.js';

interface SurrealDBAccessData {
    address: string;
    password: string;
    username: string;
    namespace: string;
    database: string;
}

export class SurrealDbAdapter {

    private database: Surreal;
    private signedIn = false;

    constructor(private accessData: SurrealDBAccessData) {
        this.database = new Surreal(accessData.address);
    }

    db = async () => {
        if (!this.signedIn) {
            await this.setup();
            this.signedIn = true;
        }
        return this.database;
    }

    private setup = async () =>{
        await this.database.signin({ user: this.accessData.username, pass: this.accessData.password });
        await this.database.use(this.accessData.namespace, this.accessData.database);
    } 
}