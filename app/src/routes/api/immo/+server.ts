import type { RequestHandler } from '@sveltejs/kit';
import { isValidationError, saveImmo } from './save';

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