require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("node:dns");

let shortUrlList = [];

function addShortUrlList(url) {
  let size = shortUrlList.length + 1;
  let shortUrl = { long_url: url, short_url: size };
  shortUrlList.push(shortUrl);
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post(
  "/api/shorturl",
  function (req, res, next) {
    const url = req.body.url.toString();
    console.log(url);
    try {
      const validURL = new URL(url);
      dns.lookup(validURL.hostname, (err, address, family) => {
        if (!err) {
          addShortUrlList(url);
          next();
        } else {
          res.json({ error: "invalid url" });
        }
      });
    } catch (e) {
      res.json({ error: "invalid url" });
    }
  },
  function (req, res) {
    let shortUrl = shortUrlList.find(
      (shortUrl) => shortUrl.long_url === req.body.url,
    );
    res.json({
      original_url: shortUrl.long_url,
      short_url: shortUrl.short_url,
    });
  },
);

app.get("/api/shorturl/:id", function (req, res) {
  let id = Number(req.params.id);
  let url = shortUrlList.find((url) => url.short_url === id);
  if (url === undefined) {
    res.send("<pre>Not found</pre>");
  } else {
    res.redirect(url.long_url);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
