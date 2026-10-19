const express=require("express");
const { Router } = require("express");
const router=express.Router({mergeParams:true});
const User = require("../models/user.js");
const Link = require("../models/link.js");
const Visit = require("../models/Visit.js");
const asyncWrap=require("../utils/asyncWrap.js");
const { isAdmin } = require("../middleware/adminMiddleware.js");
const Campaign = require("../models/Campaign.js");

// Replace isAdmin with your existing admin authorization middleware.
router.get("/dashboard",isAdmin,asyncWrap(async (req, res) => {
    try {
        const [
            totalUsers,
            totalLinks,
            totalVisits,
            allLinks,
            recentLinks,
            recentVisits
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: "admin" } }),
            Link.countDocuments(),
            Visit.countDocuments(),
            Link.find().select("clicks"),
            Link.find()
                .sort({ createdAt: -1 })
                .limit(6)
                .populate("createdBy", "username email"),
            Visit.find()
                .sort({ visitedAt: -1 })
                .limit(8)
                .populate("link", "shortUrl originalUrl")
        ]);

        const totalClicks = allLinks.reduce(
            (sum, link) => sum + (link.clicks || 0),
            0
        );

        const activeLinks = allLinks.filter(
            link => (link.clicks || 0) > 0
        ).length;

        // Daily visits for the last 7 days
        const dailyMap = new Map();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const key = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0")
            ].join("-");

            dailyMap.set(key, 0);
        }

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        const dailyVisits = await Visit.find({
            visitedAt: { $gte: sevenDaysAgo }
        }).select("visitedAt");

        for (const visit of dailyVisits) {
            const date = new Date(visit.visitedAt);

            const key = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0")
            ].join("-");

            if (dailyMap.has(key)) {
                dailyMap.set(key, dailyMap.get(key) + 1);
            }
        }

        const topLinks = [...allLinks]
            .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
            .slice(0, 5);

        // Load full details for the top-performing links
        const topLinkIds = topLinks.map(link => link._id);

        const topLinksWithDetails = await Link.find({
            _id: { $in: topLinkIds }
        }).populate("createdBy", "username email");

        topLinksWithDetails.sort(
            (a, b) => (b.clicks || 0) - (a.clicks || 0)
        );

        res.render("routes/admin/routes/adminDashboard.ejs", {
            totalUsers,
            totalLinks,
            totalClicks,
            totalVisits,
            activeLinks,
            recentLinks,
            recentVisits,
            topLinks: topLinksWithDetails,
            dailyLabels: [...dailyMap.keys()],
            dailyValues: [...dailyMap.values()]
        });

    } catch (err) {
        res.status(500).send("Unable to load admin dashboard");
    }
}));


// View all users and their links
// View all users, their links, and campaigns
router.get("/users", isAdmin, asyncWrap(async (req, res) => {
    const users = await User.find({
        role: { $ne: "admin" }
    }).lean();

    const userIds = users.map(user => user._id);

    const [links, campaigns] = await Promise.all([
        Link.find({
            createdBy: { $in: userIds }
        })
        .sort({ createdAt: -1 })
        .lean(),

        Campaign.find({
            createdBy: { $in: userIds }
        })
        .sort({ createdAt: -1 })
        .lean()
    ]);

    const linksByUser = new Map();
    const campaignsByUser = new Map();

    for (const link of links) {
        const userId = link.createdBy?.toString();
        if (!userId) continue;

        if (!linksByUser.has(userId)) {
            linksByUser.set(userId, []);
        }

        linksByUser.get(userId).push(link);
    }

    for (const campaign of campaigns) {
        const userId = campaign.createdBy?.toString();
        if (!userId) continue;

        if (!campaignsByUser.has(userId)) {
            campaignsByUser.set(userId, []);
        }

        campaignsByUser.get(userId).push(campaign);
    }

    const usersWithDetails = users.map(user => {
        const userId = user._id.toString();

        return {
            ...user,
            links: linksByUser.get(userId) || [],
            campaigns: campaignsByUser.get(userId) || []
        };
    });

    res.render("routes/admin/routes/viewUser.ejs", {
        users: usersWithDetails
    });
}));

// View all user links
router.get("/links", isAdmin, asyncWrap(async (req, res) => {
    const links = await Link.find()
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 })
        .lean();

    res.render("routes/admin/routes/allLinks.ejs", {
        links
    });
}));



router.get("/campaigns", isAdmin, asyncWrap(async (req, res) => {
    const links = await Link.find()
        .populate("createdBy", "username email")
        .sort({ createdAt: 1 })
        .lean();

    const campaignMap = new Map();

    for (const link of links) {
        let campaignName = link.campaignName;

        if (!campaignName && typeof link.campaign === "string") {
            campaignName = link.campaign;
        } else if (!campaignName && link.campaign?.name) {
            campaignName = link.campaign.name;
        }

        if (!campaignName || !campaignName.trim()) continue;

        const owner = link.createdBy;
        const ownerId = owner?._id?.toString() || "unknown";

        // Exclude admin-owned campaigns if the populated user has a role.
        if (owner?.role === "admin") continue;

        const key = `${ownerId}:${campaignName.trim().toLowerCase()}`;

        if (!campaignMap.has(key)) {
            campaignMap.set(key, {
                name: campaignName.trim(),
                username: owner?.username || "Unknown user",
                email: owner?.email || "",
                totalLinks: 0,
                totalClicks: 0,
                firstCreated: link.createdAt || null,
                latestCreated: link.createdAt || null
            });
        }

        const campaign = campaignMap.get(key);

        campaign.totalLinks++;
        campaign.totalClicks += Number(link.clicks) || 0;

        if (link.createdAt) {
            if (
                !campaign.firstCreated ||
                new Date(link.createdAt) < new Date(campaign.firstCreated)
            ) {
                campaign.firstCreated = link.createdAt;
            }

            if (
                !campaign.latestCreated ||
                new Date(link.createdAt) > new Date(campaign.latestCreated)
            ) {
                campaign.latestCreated = link.createdAt;
            }
        }
    }

    const campaigns = [...campaignMap.values()].sort(
        (a, b) => new Date(b.latestCreated || 0) - new Date(a.latestCreated || 0)
    );

    res.render("routes/admin/routes/campaigns.ejs", {
        campaigns
    });
}));

// Admin profile
router.get("/profile", isAdmin, asyncWrap(async (req, res) => {
    const admin = await User.findById(req.user._id)
        .select("username email role createdAt")
        .lean();

    if (!admin || admin.role !== "admin") {
        req.flash("error", "Admin profile not found.");
        return res.redirect("/admin/dashboard");
    }

    res.render("routes/admin/routes/adminProfile.ejs", {
        admin
    });
}));

module.exports=router;
