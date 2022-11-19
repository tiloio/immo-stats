import Surreal from 'surrealdb.js';

interface SurrealDBAccessData {
    address: string;
    password: string;
    username: string;
    namespace: string;
    database: string;
}

export class SurrealDbAdapter {

    private signedIn = false;

    constructor(private accessData: SurrealDBAccessData) {
    }

    db = async () => {
        if (!this.signedIn) {
            await this.setup();
            this.signedIn = true;
        }
    }

    private setup = async () =>{
        await Surreal.Instance.connect(this.accessData.address);
        await Surreal.Instance.signin({ user: this.accessData.username, pass: this.accessData.password });
        await Surreal.Instance.use(this.accessData.namespace, this.accessData.database);
    } 
}