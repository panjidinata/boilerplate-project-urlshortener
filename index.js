require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("node:dns");

const option = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

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
    let url = req.body.url.toString();
    const regex = /(https:\/\/)(\S+)/;
    const found = url.match(regex);

    if (found != null) {
      dns.lookup(found[2], option, (err, address, family) => {
        if (!err) {
          addShortUrlList(url);
          next();
        }
      });
    } else {
      res.json({ error: "Invalid URL" });
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
