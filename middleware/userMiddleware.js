
module.exports.isAuthenticate = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please login first!");
        return res.redirect("/user/login");
    }

    next();
};
