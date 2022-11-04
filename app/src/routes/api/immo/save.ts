import { ImmoRepository } from "../../../lib/server/immo.repository";

const immoRepo = await ImmoRepository.create();

export const saveImmo = async (immos: unknown[]) => {
        const validatedImmos = immos.map(validate);
        await immoRepo.save(valdatedImmos);
}

const validate = (immo: unknown): Immo => {
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
}

const validateArray = <T>(name: string, array: unknown, validationFn: (name: string, some: unknown) => any) => {
    if (Array.isArray(array) &&
        array.forEach((line, index) => validateText(`${name}[${index}]`, line)))
        return array as T[];
    throw new ValidationError(name, 'array', array);
}

const validateImage = (image: unknown) => {
    return {
        url: validateText(`url`, image.url),
        date: validateNumber(`date`, image.date),
        hash: validateText(`hash`, image.hash),
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

const validateMultilineText = (name: string, text: unknown) => {
    ret
    if (Array.isArray(text) && text.forEach(line => validateText(name, line))) return text as string[];
    throw new ValidationError(name, 'multiline text', text);
}

class ValidationError extends Error {
    constructor(name: string, expected: string, got: any) {
        super(`VALIDATION FAILED - ${name}: expected "${expected}" but got "${JSON.stringify(got)}".`)
    }
}
const isValidationError = (err: unknown): err is Error => err instanceof ValidationError;