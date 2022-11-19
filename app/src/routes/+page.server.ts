import { ImmoRepository } from '$lib/server/immo.repository';
import type { PageServerLoad } from '.svelte-kit/types/src/routes/$types';

const immoRepo = await ImmoRepository.create();

export const load: PageServerLoad = async () => {
  const ads = await immoRepo.loadAll();
  return { ads };
}