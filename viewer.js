const Nightmare = require('nightmare');
const ProxyLists = require('proxy-lists');

const options = { countries: ['fr', 'ca', 'ch', 'be'] };
const views = 100;
const multiplicator = 1;
const debit = 4500;
const url = 'https://www.google.com';
const timer = 3000;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function execView(proxy, id) {
  console.log(`Start viewer ${id} with proxy ${proxy.ipAddress}:${proxy.port}`);
  const nightmare = Nightmare({ show: false, switches: {
    'proxy-server': `${proxy.ipAddress}:${proxy.port}`,
    'ignore-certificate-errors': true
  }});
  try {
    await nightmare.goto(url);
    console.log(`Goto done for viewer ${id}`);
    await nightmare.wait(1000 + getRandomInt(timer));
    console.log(`Wait done for viewer ${id}`);
  } catch (e) {
    console.error(`Error for viewer ${id}:`, e);
  }
  await nightmare.end();
  console.log(`End done for viewer ${id}`);
}

async function getViews(proxies) {
  console.log(`Starting bot attack with ${proxies.length} proxies`);
  const executor = [];
  for (let i = 0; i < proxies.length; i += multiplicator) {
    console.log(`Launching ${multiplicator} viewers, progress: ${i + 1}/${proxies.length}`);
    for (let j = 0; j < multiplicator; j++) {
      const index = i + j;
      if (index < proxies.length) {
        const proxy = proxies[index];
        executor[index] = execView(proxy, index);
      }
    }
    await Promise.all(executor.slice(i, i + multiplicator));
    await new Promise(resolve => setTimeout(resolve, debit));
  }
}

(async () => {
  const proxies = await ProxyLists.getProxies(options);
  console.log(`Found ${proxies.length} proxies`);
  const selectedProxies = proxies.slice(0, views);
  await getViews(selectedProxies);
})();
