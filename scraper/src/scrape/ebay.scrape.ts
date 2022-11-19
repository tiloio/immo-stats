import { test, expect, Page, Locator, ElementHandle, BrowserContext } from '@playwright/test';
import type { ElementHandleForTag } from 'playwright-core/types/structs';
import { imageHash } from 'image-hash';
import { transferImmos } from '../adapters/immo-api';
import { Immo } from '../../../immo';

type Article = {
  text: string,
  url: string,
  element: ElementHandleForTag<'a'>
}

test('scrape articles', async ({ page, context, request }) => {
  await page.goto('https://www.ebay-kleinanzeigen.de/s-suchanfrage.html?keywords=haus&categoryId=&locationStr=Wolfsburg+-+Niedersachsen&locationId=3071&radius=20&sortingField=SORTING_DATE&adType=&posterType=&pageNum=1&action=find&maxPrice=&minPrice=800');
  await clearPageFromBanners(page);

  const articles = await scrapeArticles(page);
  console.log(`Read ${articles.length} articles`);

  const immos: Immo[] = [];
  for (const article of articles.slice(0, 3)) {
    immos.push(await extractImmo(context, article));
  }
  await transferImmos(request, immos);
});


const extractImmo = async (context: BrowserContext, article: Article): Promise<Immo> => {
  const [page] = await Promise.all([
    context.waitForEvent('page'),
    article.element.click({ button: "middle" })
  ]);
  await page.waitForLoadState('networkidle');
  console.log(`Fetch article (${page.url()})`);

  await page.locator('.galleryimage-element').first().waitFor({ state: 'visible' });
  const imageElements = await page.locator('.galleryimage-element').elementHandles();

  const images = await extractImages(imageElements);

  const title = await fetchText(page.locator('h1').first());
  const price = await fetchText(page.locator('h2.boxedarticle--price'));
  const date = await fetchText(page.locator('i.icon-calendar-gray-simple + span'));
  const address = await fetchText(page.locator('i.icon-location-pin-filled + span').first());
  const livingQm = await listElementText(page, "Wohnfläche");
  const propertyQm = await listElementText(page, "Grundstücksfläche");
  const text = await fetchArrayText(page.locator("#viewad-description"));

  await page.close();

  const pages = await context.pages();
  await pages[0].bringToFront()

  return {
    scrape: {
      date: Date.now(),
      source: "ebay",
      url: page.url(),
    },
    title,
    price,
    date,
    address,
    livingQm,
    propertyQm,
    text,
    images: images.filter(img => img != null) as any
  }
}

const listElementText = async (page: Page, name: string) => normalizeToOneLiner(await page
  .locator('li', { has: page.locator(`text="${name}"`) })
  .locator('span')
  .allTextContents());

const fetchText = async (locator: Locator) => normalizeToOneLiner(await locator.allInnerTexts());
const fetchArrayText = async (locator: Locator) => normalizeText(await locator.allInnerTexts());

const normalizeToOneLiner = (text: string | null | string[]) => normalizeText(text).filter(text => text.trim() != '').join('\n');
const normalizeText = (text: string | null | string[]) => Array.isArray(text) ? text.flatMap(normalize) : text ? normalize(text) : [''];
const normalize = (text: string) => text.split('\n').map(txt => txt.trim());

const extractImages = (imageElements: ElementHandle[]) =>
  Promise.all(imageElements.map(async image => {

    const imgElement = await image.$('img');

    const url = await imgElement?.getAttribute('src');

    if (!url) return null;

    const hash = await hashImage(url)

    return { url, hash, date: Date.now() }
  }));

const hashImage = (url: string) => new Promise((resolve, reject) => imageHash(url, 64, true, (error, data) => {
  if (error) reject(error);
  resolve(data);
}));


const scrapeArticles = async (page: Page) => {
  const articleElements = await page.$$('article');
  const articles = await Promise.all(articleElements.map(async article => {
    const text = await article.textContent();
    const element = await article.$('h2 a');

    return {
      text: text ?? '',
      element,
      url: await article.getAttribute('data-href') ?? ''
    } as Article
  }));

  return articles.filter(filterAds);
}


const filterAds = (article: Article) => {
  if (article.text.toLowerCase().includes('anzeige')) return false;
  return true;
}

const clearPageFromBanners = async (page: Page) => {
  const acceptBannerButton = page.locator('#gdpr-banner-accept');

  if (await acceptBannerButton.isVisible())
    await acceptBannerButton.click();
}
