import { closeBrowser } from "./browser";
import { createEbayPage } from "./ebay-page";


const exec = async () => {
  const { actions, elements } = await createEbayPage("https://www.ebay-kleinanzeigen.de/s-38442/preis:1000:/haus/k0l3073r10");

  await actions.waitForAndAcceptConsent();

};

exec().catch(console.error).finally(async () => {
  await closeBrowser()
});

