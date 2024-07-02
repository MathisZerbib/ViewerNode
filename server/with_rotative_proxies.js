const puppeteer = require("puppeteer-extra");
const { executablePath } = require("puppeteer");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const { setTimeout } = require("node:timers/promises");
const ProxyLists = require("proxy-lists");

const url = "https://www.youtube.com/watch?v=kbtTdQ159ps";
const timer = 152000;
const views = 10; // Number of views to generate each time the script is run
const limiter = 7; // Maximum number of simultaneous instances do not exceed 10
const headless = false; // Set to true to run chrome in headless mode (No Graphical rendering is enabled by default)

// load params
puppeteer.use(stealthPlugin());

const options = {
  countries: ["fr"],
  protocols: ["http", "https"],
};
let proxies = [];
let activeBrowsers = 0;
let successfulViews = 0;

const gettingProxies = ProxyLists.getProxies(options);

gettingProxies.on("data", function (newProxies) {
  proxies = proxies.concat(newProxies);
  console.log("Fetched proxies: " + proxies.length);
  if (proxies.length >= 100) {
    gettingProxies.emit("end");
  }
});

gettingProxies.on("end", function () {
  if (proxies.length === 0) {
    console.log("No proxies fetched.");
  } else {
    startViewing();
  }
});

async function launchBrowser(proxy) {
  try {
    const browser = await puppeteer.launch({
      headless: headless,
      executablePath: executablePath(),
      args: [`--proxy-server=${proxy.ipAddress}:${proxy.port}`],
    });
    return browser;
  } catch (error) {
    console.error(
      `Failed to launch browser with proxy ${proxy.ipAddress}:${proxy.port} - ${error.message}`
    );
    throw error;
  }
}

async function visitSite(browser, proxy) {
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
    });

    try {
      // Try to click accept cookies button
      await page.waitForSelector(
        "#content > div.body.style-scope.ytd-consent-bump-v2-lightbox > div.eom-buttons.style-scope.ytd-consent-bump-v2-lightbox > div:nth-child(1) > ytd-button-renderer:nth-child(1) > yt-button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill",
        { timeout: 10000 } // Adjust timeout as needed
      );

      await page.$eval(
        "#content > div.body.style-scope.ytd-consent-bump-v2-lightbox > div.eom-buttons.style-scope.ytd-consent-bump-v2-lightbox > div:nth-child(1) > ytd-button-renderer:nth-child(1) > yt-button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill",
        (acceptCookies) => acceptCookies.click()
      );
    } catch (error) {
      console.error("Accept cookies button not found or timeout");

      // If accept cookies button not found, try clicking on a different element
      try {
        await page.$eval(
          "#movie_player > div.ytp-cued-thumbnail-overlay > button",
          (button) => button.click()
        );
      } catch (error) {
        console.error("Fallback button click failed");
        throw error;
      }
    }

    await setTimeout(timer);
    successfulViews++;
    console.log(`Successfully viewed ${successfulViews}/${views}`);
  } catch (error) {
    console.error(
      `Error visiting site with proxy ${proxy.ipAddress}:${proxy.port} - ${error.message}`
    );
  } finally {
  
  }
}

async function startViewing() {
  let proxyIndex = 0;

  // Launch initial browsers up to 'limiter' count
  while (activeBrowsers < limiter && proxyIndex < proxies.length) {
    const proxy = proxies[proxyIndex];
    proxyIndex++;

    (async (proxy) => {
      activeBrowsers++;
      let browser;

      try {
        browser = await launchBrowser(proxy);
        await visitSite(browser, proxy);
      } catch (error) {
        console.error(
          `Error with proxy ${proxy.ipAddress}:${proxy.port} - ${error.message}`
        );
      } finally {
        if (browser) {
          await browser.close();
        }
        activeBrowsers--;
      }
    })(proxy);
  }

  // Continue launching new browsers until 'views' count is reached
  while (successfulViews < views && proxyIndex < proxies.length) {
    while (activeBrowsers >= limiter) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const proxy = proxies[proxyIndex];
    proxyIndex++;

    (async (proxy) => {
      activeBrowsers++;
      let browser;

      try {
        browser = await launchBrowser(proxy);
        await visitSite(browser, proxy);
      } catch (error) {
        console.error(
          `Error with proxy ${proxy.ipAddress}:${proxy.port} - ${error.message}`
        );
      } finally {
        if (browser) {
          await browser.close();
        }
        activeBrowsers--;
      }
    })(proxy);
  }

  // Wait for all browsers to finish
  while (activeBrowsers > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`Completed ${successfulViews} views.`);
}

// Ensure the proxies fetching completes by emitting 'end' manually after a delay if not enough proxies are fetched
setTimeout(() => {
  if (proxies.length < 100) {
    gettingProxies.emit("end");
  }
}, 30000); // 30 seconds delay to fetch proxies
