export type Immo = {
    scrape: {
        source: string;
        date: number;
        url: string;
    }
    title: string;
    price: string;
    date: string;
    address: string;
    livingQm: string;
    propertyQm: string;
    text: string[];
    images: ImmoImage[];
}

export type ImmoImage = {
    url: string;
    date: number;
    hash: string;
}
