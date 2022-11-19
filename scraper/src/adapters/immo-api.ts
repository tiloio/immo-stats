import { APIRequestContext } from '@playwright/test';
import { Immo } from '../../../immo';
import {env} from './environment';

const IMMO_API_URL = env('IMMO_API_URL');

export const transferImmos = async (request: APIRequestContext, immos: Immo[]) => {
    console.log(`Transfer ${immos.length} immos to ${IMMO_API_URL}`);
    const response = await request.post(IMMO_API_URL, {
        data: JSON.stringify({ immos }),
        headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok()) return;

    throw new Error(`IMMO API ERROR - Couldn't transfer immos: POST ${IMMO_API_URL}: ${response.status()} "${await response.text()}"\n\n${JSON.stringify(immos, null, 2)}`)
}