'use strict';
const middlewareObj = {};

const Campground = require("../models/campground"),
	  Comment    = require("../models/comment");

var referedUrl = "/";

middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if (req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if (err){
				req.flash("error", "Campground not found");
				res.redirect("back");
			}
			else{
				// DOES USER OWN CAMPGROUND
				if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin ){
					next();
				}
				else {
					req.flash("error", "You do not have permission to do that");
					res.redirect('back');
				}
			}
		});
	}
	else {
		req.flash("error", "You must be logged in to do that");
		res.redirect('back');
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next){
	if (req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if (err){
				res.redirect("back");
			}
			else{
				// DOES USER OWN COMMENT
				if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin ){
					next();
				}
				else {
					req.flash("error", "You do not have permission to do that");
					res.redirect('back');
				}
			}
		});
	}
	else {
		req.flash("error", "You must be logged in to do that");
		res.redirect('back');
	}
}

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You must be logged in to do that");
	res.redirect("/login");
}


middlewareObj.isLoggedOut = function(req, res, next){
	if(!req.isAuthenticated()){
		return next();
	}
	//res.redirect(referedUrl);
	//referedUrl = "/";
}

middlewareObj.sanitize = function(req, res, next){
	req.body.description = req.sanitize(req.body.description);
	return next();
}

middlewareObj.restrict = function(req, res, next){
    if (!req.session.userid) {
        req.session.redirectTo = req.path;
        res.redirect('/login');
    } else {
        next();
    }
};

module.exports = middlewareObj;