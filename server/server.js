// const express = require("express");
// const app = express();
// const port = 3000;
// const puppeteer = require("puppeteer");
// const viewer = require("./viewer.js");
// var isLaunched = false;

// app.get("/", async (req, res) => {

//   //1. Show HomePage
//   res.send(`<html><body>
//     <p>Please enter a youtube video url </p>
//     </body></html>`);

// });

// app.get("/launch", async (req, res) => {
//     if(isLaunched === false){
//   //1. Execute function to get lead_story
//   let timedBot = await crawlSite();

//   //2. Show lead_story
//   res.send(`<html><body>
//     <p>Last viewer succesfully launched at ${timedBot}</p>
//     </body></html>`);
//     }else{
//         res.send(`<html><body>
//         <p>Viewer is already running</p>
//         </body></html>`);
//     }
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });
const https = require("https");
const http = require("http");
const fs = require("fs");

const express = require("express");
const { Server } = require("ws");
const viewer = require("./viewer.js");

let isLaunched = false;
const PORT = process.env.PORT || 3000;

const app = express();
app.get("/", (req, res) => {
  res.send("Hi there");
});

const options = {
  // key: fs.readFileSync("./key.pem"),
  // cert: fs.readFileSync("./cert.pem"),
};

const server = http.createServer(options, app);

const wss = new Server({ server });

wss.on("connection", (ws, req) => {
  ws.on("message", async (message) => {
    const dataString = message.toString();
    if (dataString.length > 0 && !isLaunched) {
      ws.send("Bot start ! 🤖🏁");
      crawlSite(dataString);
      console.log(dataString);
    } else if (message == "stop") {
      while (viewer.view.status) {
        viewer.stopBot();
      }
      ws.send("Bot is stopped 🤖🏁");
    }

    // else if (dataString.length > 0 && isLaunched) {
    //   console.log(dataString);
    //   ws.send("The bot is already running ! 🥺👉👈");
    // }
  });
});

async function crawlSite(url) {
  console.log(`Crawl Site, url: ${url}`);
  const views = 2;
  const multiplicator = 1;
  const debit = 32000;
  const timer = 10000;
  viewer.view(url, debit, timer, multiplicator, views);
  isLaunched = true;
}

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
