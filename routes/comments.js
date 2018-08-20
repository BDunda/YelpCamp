'use strict';

const express    = require("express"),
	  Campground = require("../models/campground"),
	  Comment    = require("../models/comment"),
	  middleware = require("../middleware");

const router = express.Router({ mergeParams: true });


// Comments New
router.get("/new", middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground){
		if (err) {
			console.log;
		}
		else {
			res.render("comments/new", {campground: foundCampground, title: "New comment for " + foundCampground.name});
		}
	});
});


// Comments Create
router.post("/", middleware.isLoggedIn, function(req, res) {
	// Look up campground by id
	Campground.findById(req.params.id, function(err, foundCampground){
		if (err){
			console.log(err)
			res.redirect("/campgrounds/")
		}
		else{
		// Create new comment
			Comment.create(req.body.comment, function(err, comment){
				if (err) {
					req.flash("error", "Something went wrong");
					console.log(err);
				}
				else {
					// add uername and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.author.isAdmin = req.user.isAdmin;
					// save comment
					comment.save();
					foundCampground.comments.push(comment);
					foundCampground.save();

					// Redirect to campground show page
					req.flash("success", "Successfully added new comment");
					res.redirect("/campgrounds/" + foundCampground._id + "/" + foundCampground.name);
				}
			});
		}
	});
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if (err){
			res.redirect('back');
		}
		else {
			Campground.findById(req.params.id, function(err, foundCampground){
				if (err) {
					res.redirect('back');
				}
				else {
					// res.render("comments/edit", { campground_id: req.params.id, campground_name: req.params.name, comment: foundComment, title: "Edit comment..."} )
					res.render("comments/edit", { campground: foundCampground, comment: foundComment, title: "Edit comment..."} )
				}
			});
		}
	})
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground) { // Only searching for campground due to my use of name in the link
		if (err) {
			console.log(err);
		}
		else {
			Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
				if(err){
					res.redirect('back');
				}
				else {
					req.flash("success", "Comment edited");
					res.redirect("/campgrounds/" + req.params.id + "/" + foundCampground.name);
				}
			});
		}
	}); // Campground.findById ending bracket
});


// COMMENT DELETE ROUTE

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground) { // Only searching for campground due to my use of name in the link
		Comment.findByIdAndRemove(req.params.comment_id, function(err){
			if (err) {
				res.redirect("back");
			}
			else {
				req.flash("success", "Comment deleted");
				res.redirect("/campgrounds/" + req.params.id + "/" + foundCampground.name);
			}
		})
	}); // Campground.findById ending bracket
});


module.exports = router;