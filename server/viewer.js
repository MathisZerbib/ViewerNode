const puppeteer = require("puppeteer-extra");
const { executablePath } = require("puppeteer");
puppeteer.use(require("puppeteer-extra-plugin-stealth")());
const PuppeteerExtraPluginProxy = require("puppeteer-extra-plugin-proxy2");

module.exports = {
  view: function (url, debit, timer, multiplicator, views) {
    let status = true;

    const ProxyLists = require("proxy-lists");

    const options = { countries: ["fr", "ca", "ch", "be"] };
    const gettingProxies = ProxyLists.getProxies(options);

    let P = [];

    gettingProxies.on("data", async function (proxies) {
      if (status === true && P.length > views) {
        status = false;
        console.log("Getviews: " + P.length);
        getviews(P);
      } else if (status === true) {
        P = P.concat(proxies);
        console.log("Getproxies: " + P.length);
      }
    });

    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }

    async function execview(runner, id) {
      console.log("start view with proxy: " + id);
      if (status === true) {
        try {
          await runner
            .launch({
              headless: false,
              // executablePath: executablePath(),
              defaultViewport: null,
              executablePath: "/Applications/Arc.app/Contents/MacOS/Arc",
              // args: ["--ignore-certificate-errors"],
            })
            .then(async (browser) => {
              const page = await browser.newPage();
              await page.goto(url);
              await page.waitForTimeout(5000);
              const acceptCookies = await page.$(
                ".yt-spec-button-shape-next.yt-spec-button-shape-next--filled.yt-spec-button-shape-next--call-to-action.yt-spec-button-shape-next--size-m"
              );
              const acceptCookies1 = await page.$("#button");
              const acceptCookies2 = await page.$("button");
              await page.mouse.move(100, 100);
              await page.mouse.down();
              if (acceptCookies) {
                await acceptCookies.evaluate((element) => element.click());
              } else if (acceptCookies1) {
                await acceptCookies1.evaluate((element) => element.click());
              } else if (acceptCookies2) {
                await acceptCookies2.evaluate((element) => element.click());
              }
              await page.waitForTimeout(debit);
              await page.mouse.move(200, 200);
              await page.mouse.up();
              console.log("view with proxy: " + id);
              await page.waitForTimeout(getRandomInt(timer));
              await page.close();
            });
        } catch (e) {
          console.log("error: ", e);
        }
      }
    }

    function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    function getviews(proxies) {
      var executor = [];
      for (let i = 0; i <= proxies.length; i += multiplicator) {
        for (let x = 0; x !== multiplicator; x++) {
          let counter = i + x;

          if (
            proxies[counter] == undefined ||
            proxies[counter].ipAddress == undefined ||
            proxies[counter].port == undefined
          ) {
            break;
          } else {
            console.log(
              "Using: " +
                JSON.stringify(
                  proxies[counter].ipAddress + ":" + proxies[counter].port
                )
            );
            let ipAddress = JSON.stringify(proxies[counter].ipAddress);
            let port = JSON.stringify(proxies[counter].port);

            executor[counter] = puppeteer.use(
              PuppeteerExtraPluginProxy({
                address: ipAddress,
                port: port,
              })
            );
            let runner = executor[counter];
            execview(runner, counter);
          }
          sleep(debit);
        }
      }
    }
  },
  stopBot: function () {
    console.log("stop bot");
  },
  status: function (status) {
    return status;
  },
};
