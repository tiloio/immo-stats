import puppeteer from "puppeteer";

const exec = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://www.ebay-kleinanzeigen.de/s-38442/preis:1000:/haus/k0l3073r10"
  );
  await browser.close();
};

exec().catch(console.error);
