const isAdmin = (req, res, next) => {
    // Check whether the user is logged in
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        req.flash("error", "Please log in first.");
        return res.redirect("/user/login");
    }

    // Check whether the logged-in user is an admin
    if (req.user.role !== "admin") {
        req.flash("error", "Access denied. Admins only.");
        return res.redirect("/user/dashboard");
    }

    next();
};

module.exports = { isAdmin };