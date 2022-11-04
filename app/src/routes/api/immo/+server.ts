import type { RequestHandler } from '@sveltejs/kit';
 
export const POST: RequestHandler = async ({ request }) => {
  const { a, b } = await request.json();
  return new Response();
}