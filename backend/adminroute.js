const express=require("express");
const { Router } = require("express");
const mongoose = require("mongoose");

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

// View all user links with their campaigns
router.get("/links", isAdmin, asyncWrap(async (req, res) => {
    const [links, campaigns] = await Promise.all([
        Link.find()
            .populate("createdBy", "username email")
            .sort({ createdAt: -1 })
            .lean(),

        Campaign.find()
            .select("name links")
            .lean()
    ]);

    // Map each link ID to its campaign names
    const campaignMap = new Map();

    for (const campaign of campaigns) {
        for (const linkId of campaign.links || []) {
            const id = linkId.toString();

            if (!campaignMap.has(id)) {
                campaignMap.set(id, []);
            }

            campaignMap.get(id).push(campaign.name);
        }
    }

    // Attach campaign names to each link
    const linksWithCampaigns = links.map(link => ({
        ...link,
        campaignNames: campaignMap.get(link._id.toString()) || []
    }));

    res.render("routes/admin/routes/allLinks.ejs", {
        links: linksWithCampaigns
    });
}));

router.get("/campaigns", isAdmin, asyncWrap(async (req, res) => {
    try {
        const campaignsData = await Campaign.find()
            .populate("createdBy", "username email role")
            .populate("links", "clicks createdAt")
            .sort({ createdAt: -1 })
            .maxTimeMS(10000)
            .lean();

        const campaigns = campaignsData
            .filter(campaign =>
                campaign.createdBy &&
                campaign.createdBy.role !== "admin"
            )
            .map(campaign => {
                const owner = campaign.createdBy;
                const links = campaign.links || [];
                const dates = links
                    .map(link => link.createdAt)
                    .filter(Boolean)
                    .map(date => new Date(date).getTime());

                return {
                    name: campaign.name,
                    username: owner.username || "Unknown user",
                    email: owner.email || "",
                    totalLinks: links.length,
                    totalClicks: links.reduce(
                        (total, link) => total + (Number(link.clicks) || 0),
                        0
                    ),
                    firstCreated: dates.length
                        ? new Date(Math.min(...dates))
                        : null,
                    latestCreated: dates.length
                        ? new Date(Math.max(...dates))
                        : campaign.createdAt || null
                };
            });


        return res.render("routes/admin/routes/campaigns.ejs", {
            campaigns
        });
    } catch (error) {
        return res.status(500).send("Failed to load campaigns. Check Render logs.");
    }
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
