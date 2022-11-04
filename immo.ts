export type Immo = {
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
    hash: string;
}
