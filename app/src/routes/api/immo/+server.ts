import type { RequestHandler } from '@sveltejs/kit';
import { ImmoRepository } from '../../../lib/server/immo.repository';
import { saveImmo } from './save';

const immoRepo = await ImmoRepository.create();

export const POST: RequestHandler = async ({ request }) => {
  const json = await request.json();

  try {
    await saveImmo(json.immos);
  } catch (error) {
    if (isValidationError(error)) return new Response(error.message, { status: 400 });
    console.error('POST immo failed -', error);
    return new Response('unknown error', { status: 500 });
  }
  return new Response();
}