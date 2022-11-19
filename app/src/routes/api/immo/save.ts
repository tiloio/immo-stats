import type { Immo } from "../../../../../immo";
import { ImmoRepository } from "../../../lib/server/immo.repository";

const immoRepo = await ImmoRepository.create();

export const saveImmo = async (immos: unknown[]) => {
    const validatedImmos = immos.map(validate);
    await immoRepo.saveAll(validatedImmos);
}

const validate = (immo: any): Immo => {
    try {
        return {
            scrape: {
                source: validateText('scrape.source', immo.scrape.source),
                date: validateNumber('scrape.date', immo.scrape.date),
                url: validateText('scrape.url', immo.scrape.url),
            },
            title: validateText('title', immo.title),
            price: validateText('price', immo.price),
            date: validateText('date', immo.date),
            address: validateText('address', immo.address),
            livingQm: validateText('livingQm', immo.livingQm),
            propertyQm: validateText('propertyQm', immo.propertyQm),
            text: validateArray('text', immo.text, validateText),
            images: validateArray('images', immo.images, validateImage),
        }
    } catch (error) {
        console.error(`Immo validation failed "${(error as any).message}"\n\n${JSON.stringify(immo, null, 2)}`);
        throw error;
    }
}

const validateArray = <T>(name: string, array: any, validationFn: (name: string, some: unknown) => any) => {
    if (Array.isArray(array)) {
        array.forEach((some, index) => validationFn(`${name}[${index}]`, some));
        return array as T[];
    }
    throw new ValidationError(name, 'array', array);
}

const validateImage = (name: string, image: unkn) => {
    return {
        url: validateText(`${name}.url`, image.url),
        date: validateNumber(`${name}.date`, image.date),
        hash: validateText(`${name}.hash`, image.hash),
    }
}

const validateNumber = (name: string, number: unknown) => {
    if (typeof number === 'number') return number;
    throw new ValidationError(name, 'number', number);
}

const validateText = (name: string, text: unknown) => {
    if (typeof text === 'string') return text;
    throw new ValidationError(name, 'string', text);
}

class ValidationError extends Error {
    constructor(name: string, expected: string, got: any) {
        super(`VALIDATION FAILED - ${name}: expected "${expected}" but got "${JSON.stringify(got)}".`)
    }
}
export const isValidationError = (err: unknown): err is Error => err instanceof ValidationError;