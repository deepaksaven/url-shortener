const Url = require("../models/urlModel");
const { randomBytes } = require("crypto");

const createShortUrl = async (req, res) => {
    try {
      // 1. Get original URL from request body
        const { originalUrl } = req.body;

        // 2. Validate input
        if (!originalUrl) {
            return res.status(400).json({
                message: "Please provide a URL"
            });
        }
         // 3. Validate URL format
         let parsedUrl;
         try {
            //here URL() is js constructor,that splits the link into labeled pieces
            parsedUrl = new URL(originalUrl);
            } catch (error) {
            return res.status(400).json({  
                message: "Please provide a valid URL"
            });
         }
           if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({
                message: "Only HTTP and HTTPS URLs are allowed"
            });
        }
       
        // 4. Generate unique short ID
      //This generates a random 8-character hexadecimal ID.
        const shortId = randomBytes(4).toString("hex");

        // 5. Create document in MongoDB
        const newUrl = await Url.create({
            originalUrl,
            shortUrl: shortId
        });

        // 6. Send response
        return res.status(201).json({
            message: "Short URL created successfully",
            shortUrl: `http://localhost:5001/api/${newUrl.shortUrl}`,
            originalUrl: newUrl.originalUrl
        });
    } catch (error) {
        console.error("Error creating short URL:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }   
}
const redirectUrl = async (req, res) => {
    try {
        const { shortUrl } = req.params;
        const url = await Url.findOne({ shortUrl });
        if (!url) {
            return res.status(404).json({
                message: "Short URL not found"
            });
        }   
        url.clicks++;       
        await url.save();
        return res.redirect(url.originalUrl);
    } catch (error) {
        console.error("Error redirecting to original URL:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getUrlHistory = async (req, res) => {
    try {
        const urls = await Url.find()
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            urls
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch URL history"
        });
    }
};

module.exports = {
    createShortUrl,
    redirectUrl,
    getUrlHistory
};
