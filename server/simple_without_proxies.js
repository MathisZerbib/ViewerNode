const puppeteer = require("puppeteer-extra");
const { executablePath } = require("puppeteer");
const pluginProxy = require("puppeteer-extra-plugin-proxy");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const { setTimeout } = require("node:timers/promises");
const url = "https://www.youtube.com/watch?v=kbtTdQ159ps";
const timer = 152000;

puppeteer.use(stealthPlugin());

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
  });

  return browser;
}

async function visitSite(browser) {
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle2",
  });

  await setTimeout(2000);
  await page.$eval(
    "#content > div.body.style-scope.ytd-consent-bump-v2-lightbox > div.eom-buttons.style-scope.ytd-consent-bump-v2-lightbox > div:nth-child(1) > ytd-button-renderer:nth-child(1) > yt-button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill",
    (acceptCookies) => acceptCookies.click()
  );

  await setTimeout(timer);
  await page.close();
}

(async () => {
  const browser = await launchBrowser();

  await visitSite(browser);

  await browser.close();
})();
