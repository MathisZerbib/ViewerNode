const Nightmare = require('nightmare')
var ProxyLists = require('proxy-lists');

var options = { countries: ['fr', 'ca', 'ch','be']};
var gettingProxies = ProxyLists.getProxies(options);

var P = [];
var status = true;
var views = 100;
var multiplicator = 1;
var debit = 4500;
var url = "https://www.ebay.fr/itm/352661550975";
var timer = 3000; // random 1000 - x

gettingProxies.on('data', function(proxies) {
    if(status === true && P.length > views) {
        status = false;
        getviews(P);
    }
    else if (status === true) {
        P = P.concat(proxies);
        console.log("Proxies: ", P.length);
    }
});
gettingProxies.on('error', function(error) { });
gettingProxies.once('end', function() { });

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function execview(nightmare, id) {
    console.log("start viewer " + id);
    try {
        await nightmare.goto(url);
        console.log("goto done");
        let wait = await nightmare.wait(1000 + getRandomInt(timer));
        console.log("wait 5s done");
        let end = await nightmare.end();
    } catch (e) {
        console.log("error: ", e);
        let end = await nightmare.end();
    }
    console.log("end done " + id);
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function getviews(proxies) {
    console.log("start bot attack! proxies.lenght: ",proxies.length);
    var executor = [];

    for(let i = 0; i <= proxies.length; i += multiplicator) {
        console.log("lunch: ", multiplicator);
        for(let x = 0; x !== multiplicator; x++) {
            console.log("progress: ", proxies.length + " / " + (i + x));
            executor[i + x] = Nightmare({ show: true , switches: {
                    'proxy-server':  proxies[i + x].ipAddress + ":" + proxies[i + x].port,
                    'ignore-certificate-errors': true
                }});
            let nightmare = executor[i + x];
            console.log("view with proxy: "+ proxies[i + x].ipAddress + ":" + proxies[i + x].port);
            execview(nightmare, i + x)
        }
       await sleep(debit)
    }
}
