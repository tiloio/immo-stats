import puppeteer, { Browser } from "puppeteer";

let browser: Browser = undefined;

export const currentBrowser = async (): Promise<Browser> => {
    if (browser) return browser;

    browser = await puppeteer.launch({
        headless: false,
        slowMo: 100
    });
    return browser;
}

export const closeBrowser = async () => {
    if (!browser) return;
    await browser.close();
}