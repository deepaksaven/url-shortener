const express = require("express");
const router = express.Router();
const { createShortUrl,redirectUrl,getUrlHistory } = require("../controllers/urlController");


router.post("/shorten", createShortUrl);
router.get("/history", getUrlHistory);
router.get("/:shortUrl", redirectUrl);

module.exports = router;
