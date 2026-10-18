const express=require("express");
const { Router } = require("express");
const router=express.Router({mergeParams:true});
const User=require("../models/user.js");
const Link = require("../models/link.js");
const asyncWrap=require("../utils/asyncWrap.js");
const { isAuthenticate } = require("../middleware/userMiddleware.js");
const Campaign = require("../models/Campaign");
const Visit = require("../models/Visit.js");
const VisitModule = require("../models/Visit.js");


router.get("/new/url",isAuthenticate,(req,res)=>{
  res.render("routes/newUrl.ejs");
});

router.post("/shorten/link",asyncWrap( async (req, res) => {
    try {
        const { originalUrl, customName } = req.body;

        // Check whether fields are empty
        if (!originalUrl || !customName || !customName.trim()) {
            req.flash("error", "Please fill in all fields.");
            return res.redirect("/user/new/url");
        }

        // Validate the original URL
        let parsedUrl;

        try {
            parsedUrl = new URL(originalUrl);
        } catch {
            req.flash("error", "Please enter a valid URL.");
            return res.redirect("/user/new/url");
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            req.flash("error", "Only HTTP and HTTPS URLs are allowed.");
            return res.redirect("/user/new-url");
        }

        // Normalize the custom name
        const shortUrl = customName.trim().toLowerCase();

        // Check whether the custom name already exists
        const existingLink = await Link.findOne({ shortUrl });

        if (existingLink) {
            req.flash("error", "This custom name is already taken.");
            return res.redirect("/user/new/url");
        }

        // Save the link in MongoDB
        await Link.create({
            originalUrl: parsedUrl.href,
            shortUrl,
            createdBy: req.user._id
        });

        req.flash("success", "Your short URL has been created!");
        return res.redirect("/user/dashboard");

    } catch (err) {
        // Handle duplicate-name errors, including simultaneous requests
        if (err.code === 11000) {
            req.flash("error", "This custom name is already taken.");
            return res.redirect("/user/new/url");
        }

        console.error("Error creating short URL:", err);

        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/user/new/url");
    }
}));



// GET: Show user's campaigns and available links
router.get("/campaigns", isAuthenticate, asyncWrap(async (req, res) => {
    try {
        const [campaigns, links] = await Promise.all([
            Campaign.find({ createdBy: req.user._id })
                .populate("links")
                .sort({ createdAt: -1 }),

            Link.find({ createdBy: req.user._id })
                .sort({ createdAt: -1 })
        ]);

        res.render("routes/campaigns.ejs", {
            user: req.user,
            campaigns,
            links
        });
    } catch (err) {
        console.error("Load campaigns error:", err);
        req.flash("error", "Unable to load your campaigns.");
        return res.redirect("/user/dashboard");
    }
}));

// POST: Create a campaign
router.post("/campaigns", isAuthenticate, asyncWrap( async (req, res) => {
    try {
        const name = (req.body.name || "").trim();
        const description = (req.body.description || "").trim();

        let selectedLinks = req.body.links || [];

        if (!Array.isArray(selectedLinks)) {
            selectedLinks = [selectedLinks];
        }

        selectedLinks = [...new Set(selectedLinks)];

        if (!name) {
            req.flash("error", "Campaign name is required.");
            return res.redirect("/user/campaigns");
        }

        // Only allow links owned by this user
        const ownedLinks = await Link.find({
            _id: { $in: selectedLinks },
            createdBy: req.user._id
        }).select("_id");

        // Reject invalid or links belonging to another user
        if (ownedLinks.length !== selectedLinks.length) {
            req.flash("error", "One or more selected links are invalid.");
            return res.redirect("/user/campaigns");
        }

        await Campaign.create({
            name,
            description,
            links: ownedLinks.map(link => link._id),
            createdBy: req.user._id
        });

        req.flash("success", "Campaign created successfully!");
        return res.redirect("/user/campaigns");

    } catch (err) {
        console.error("Create campaign error:", err);
        req.flash("error", "Unable to create campaign.");
        return res.redirect("/user/campaigns");
    }
}));

// POST: Delete a campaign owned by the logged-in user
router.post(
    "/campaigns/:id/delete",
    isAuthenticate,
    asyncWrap(
    async (req, res) => {
        try {
            const deletedCampaign = await Campaign.findOneAndDelete({
                _id: req.params.id,
                createdBy: req.user._id
            });

            if (!deletedCampaign) {
                req.flash("error", "Campaign not found.");
                return res.redirect("/user/campaigns");
            }

            req.flash("success", "Campaign deleted successfully!");
            return res.redirect("/user/campaigns");

        } catch (err) {
            console.error("Delete campaign error:", err);
            req.flash("error", "Unable to delete campaign.");
            return res.redirect("/user/campaigns");
        }
    }
));




// Redirect short URL to original URL
router.get("/links", isAuthenticate, asyncWrap(async (req, res) => {
    try {
        const links = await Link.find({
            createdBy: req.user._id
        }).sort({ createdAt: -1 });

        res.render("routes/showLinks.ejs", { links });

    } catch (err) {
        console.error("Error fetching links:", err);
        req.flash("error", "Unable to load your links.");
        res.redirect("/user/dashboard");
    }
}));
// visitors details 

router.get("/s/:shortUrl", isAuthenticate,asyncWrap(async (req, res) => {
    try {
        const link = await Link.findOne({
            shortUrl: req.params.shortUrl.toLowerCase()
        });

        if (!link) {
            return res.status(404).send("Short URL not found");
        }

        // Save details for this visit
        await Visit.create({
            link: link._id,
            visitedAt: new Date(),
            referrer: req.get("referer") || "Direct",
            userAgent: req.get("user-agent") || "Unknown"
        });

        // Increase the total click count
        link.clicks = (link.clicks || 0) + 1;
        await link.save();

        return res.redirect(link.originalUrl);

    } catch (err) {
        console.error("Click tracking error:", err);
        return res.status(500).send("Server error");
    }
}));




// Show all short links created by the logged-in user

router.get("/links/:id/analytics", isAuthenticate, asyncWrap( async (req, res) => {
    try {
        const link = await Link.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!link) {
            return res.status(404).send("Link not found");
        }

        const visits = await Visit.find({
            link: link._id
        }).sort({ visitedAt: -1 });

        res.render("routes/linkAnalytics.ejs", {
            link,
            visits
        });

    } catch (err) {
        console.error("Analytics error:", err);
        res.status(500).send("Unable to load analytics");
    }
}));

//analytics chart 

router.get("/analytics", isAuthenticate, asyncWrap(async (req, res) => {
    try {
        // Choose the analytics period: 7, 30, or 90 days
        const allowedPeriods = [7, 30, 90];
        const requestedDays = Number(req.query.days) || 7;

        const days = allowedPeriods.includes(requestedDays)
            ? requestedDays
            : 7;

        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - (days - 1));

        // Get only the logged-in user's links
        const links = await Link.find({
            createdBy: req.user._id
        }).sort({ createdAt: -1 });

        const linkIds = links.map(link => link._id);

        // Get visit records belonging to these links
        const visits = linkIds.length
            ? await Visit.find({
                link: { $in: linkIds },
                visitedAt: { $gte: startDate }
            }).sort({ visitedAt: -1 })
            : [];

        // Prepare one entry for every day in the selected period
        const dailyMap = new Map();

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const key = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0")
            ].join("-");

            dailyMap.set(key, 0);
        }

        const browserCounts = {};
        const deviceCounts = {};
        const referrerCounts = {};

        for (const visit of visits) {
            const date = new Date(visit.visitedAt);

            const key = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0")
            ].join("-");

            if (dailyMap.has(key)) {
                dailyMap.set(key, dailyMap.get(key) + 1);
            }

            const ua = visit.userAgent || "";

            let browser = "Other";
            let device = "Desktop";

            if (/Edg\//i.test(ua)) {
                browser = "Edge";
            } else if (/OPR\//i.test(ua)) {
                browser = "Opera";
            } else if (/Firefox\//i.test(ua)) {
                browser = "Firefox";
            } else if (/Chrome\//i.test(ua)) {
                browser = "Chrome";
            } else if (/Safari\//i.test(ua)) {
                browser = "Safari";
            }

            if (/iPad|Tablet/i.test(ua)) {
                device = "Tablet";
            } else if (/iPhone|Android|Mobile/i.test(ua)) {
                device = "Mobile";
            }

            browserCounts[browser] =
                (browserCounts[browser] || 0) + 1;

            deviceCounts[device] =
                (deviceCounts[device] || 0) + 1;

            let referrer = visit.referrer || "Direct";

            if (referrer === "Direct") {
                referrer = "Direct";
            } else {
                try {
                    const hostname = new URL(referrer).hostname;
                    referrer = hostname.replace(/^www\./, "");
                } catch {
                    referrer = "Other";
                }
            }

            referrerCounts[referrer] =
                (referrerCounts[referrer] || 0) + 1;
        }

        // All-time click count from each link's counter
        const totalClicks = links.reduce(
            (sum, link) => sum + (link.clicks || 0),
            0
        );

        // Top links for this logged-in user
        const topLinks = [...links]
            .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
            .slice(0, 5);

        // Recent recorded visits
        const recentVisits = visits.slice(0, 10);

        res.render("routes/analytics.ejs", {
            links,
            visits,
            days,
            totalClicks,
            periodClicks: visits.length,
            dailyLabels: [...dailyMap.keys()],
            dailyClicks: [...dailyMap.values()],
            browserLabels: Object.keys(browserCounts),
            browserValues: Object.values(browserCounts),
            deviceLabels: Object.keys(deviceCounts),
            deviceValues: Object.values(deviceCounts),
            referrerLabels: Object.keys(referrerCounts),
            referrerValues: Object.values(referrerCounts),
            topLinks,
            recentVisits
        });

    } catch (err) {
        console.error("Analytics dashboard error:", err);
        res.status(500).send("Unable to load analytics dashboard");
    }
}));



module.exports=router;
