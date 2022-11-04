import { test, expect, Page, Locator, ElementHandle } from '@playwright/test';
import type { ElementHandleForTag } from 'playwright-core/types/structs';
import { imageHash } from 'image-hash';
import { Immo } from '../../immo';

type Article = {
  text: string,
  url: string,
  element: ElementHandleForTag<'article'>
}

test('homepage has Playwright in title and get started link linking to the intro page', async ({ page }) => {
  await page.goto('https://www.ebay-kleinanzeigen.de/s-suchanfrage.html?keywords=haus&categoryId=&locationStr=Wolfsburg+-+Niedersachsen&locationId=3071&radius=20&sortingField=SORTING_DATE&adType=&posterType=&pageNum=1&action=find&maxPrice=&minPrice=1000');
  await clearPageFromBanners(page);

  const articles = await scrapeArticles(page);
  const data = await Promise.all(articles.map(article => readArticle(page, article)));

  console.log(articles.length, data.length);
});


const readArticle = async (page: Page, article: Article): Promise<Immo> => {
  await article.element.click();

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

  return {
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

    return { url, hash }
  }));

const hashImage = (url: string) => new Promise((resolve, reject) => imageHash(url, 128, true, (error, data) => {
  if (error) reject(error);
  resolve(data);
}));


const scrapeArticles = async (page: Page) => {
  const articleElements = await page.$$('article');
  const articles = await Promise.all(articleElements.map(async article => {
    const text = await article.textContent();

    return {
      text: text ?? '',
      element: article,
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
