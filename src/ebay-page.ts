import { Page } from "puppeteer"
import { ElementHandle } from "puppeteer"
import { currentBrowser } from "./browser"

export type ElementResolver = () => Promise<ElementHandle<Element>>

export type EbayPageElements = {
    consentBanner: ElementResolver;
    consentAgreeBtn: ElementResolver;
    searchResults: {
        list: ElementResolver;
        item: (index: number) => {

            // if any of these fails we should notice that but not fail overall
            img: () => Promise<string>; // maybe check with hash if changed
            address: () => Promise<string>; // class aditem-main--top--left
            time: () => Promise<string>; // class aditem-main--top--right !!! not always
            header: () => Promise<string>; // h2 or class text-module-begin
            description: () => Promise<string>; // p or class aditem-main--middle--description
            price: () => Promise<string>; // second p or class aditem-main--middle--price
            tags: () => Promise<string[]>; // class simpletag
        }
    };
}

export type EbayPageActions = {
    waitForAndAcceptConsent: () => Promise<void>;
}

export type EbayPage = {
    elements: EbayPageElements;
    actions: EbayPageActions;
    page: Page;
}

const createEbayPageElements = (page: Page): EbayPageElements => {
    return {
        consentBanner: () => page.$('#consentBanner'),
        consentAgreeBtn: () => page.$('#gdpr-banner-accept'),
        searchResults: {
            list: () => page.$('#srchrslt-adtable'),

        }
    }
}
const createEbayPageActions = (elements: EbayPageElements, page: Page): EbayPageActions => {
    return {
        waitForAndAcceptConsent: async () => {
            const banner = await elements.consentBanner()
            if (banner == null) return;

            const agreedBtn = await elements.consentAgreeBtn();
            await agreedBtn.click();
            await page.waitForNetworkIdle({ idleTime: 150 });
        }
    }
}

export const createEbayPage = async (url: string): Promise<EbayPage> => {

    const browser = await currentBrowser();
    const page: Page = await browser.newPage();
    await page.goto(
        url,
        {
            waitUntil: "networkidle2"
        }
    );

    const elements = createEbayPageElements(page);
    const actions = createEbayPageActions(elements, page);

    return { elements, actions, page }
}