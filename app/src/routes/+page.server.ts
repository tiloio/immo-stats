import { error } from '@sveltejs/kit';

const immoRepo = await ImmoRepository.create();

export const load: PageServerLoad = async () => {
  const ads = await immoRepo.loadAll();
  return { ads };
}