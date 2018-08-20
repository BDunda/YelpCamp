'use strict';

const express    = require("express"),
	  nl2br      = require("nl2br"),
	  Campground = require("../models/campground"),
	  middleware = require("../middleware");

const router = express.Router();

// Campgrounds Page [INDEX - show all campgrounds]
router.get("/", function(req, res) {
	let noMatch;
	if (req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			}
			else {
				if (allCampgrounds.length  < 1) {
					noMatch = 'No campgrounds match that search.'
				}
				res.render("campgrounds/index", { campgrounds: allCampgrounds, noMatch: noMatch, page: 'campgrounds', title: "YelpCamp Campgrounds"});
			}
		});
	}
	else {
	// Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			}
			else {
				res.render("campgrounds/index", { campgrounds: allCampgrounds, noMatch: noMatch, page: 'campgrounds', title: "YelpCamp Campgrounds"});
			}
		});
	}
	// res.render("campgrounds", { campgrounds: campgrounds, title: "YelpCamp Campgrounds"});
});


// Create a New Campground page [NEW - show form to create new campground]
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new", { title: "YelpCamp Submit New Campground" });
});

// [CREATE - add new campgrounds to database]
router.post("/", middleware.isLoggedIn, middleware.sanitize, function(req, res) {
	// Get data from form

	let name  = req.body.name,
		price = req.body.price,
		image = req.body.image,
		desc  = req.body.description;
	let author = {
			id: req.user._id,
			username: req.user.username,
			isAdmin: req.user.isAdmin
		};
	// Definining the initial 'template' of the database
	let newCampground = { name: name, price: price, image: image, description: desc, author: author };
	// Create a new campground and save to database
	Campground.create(newCampground, function(err, newlyCreated) {
		if (err) {
			console.log();
		}
		else {
			// Redirect back to campgrounds page
			res.redirect("/campgrounds");
		}
	});
});


// [SHOW - shows more information about the campground]
router.get("/:id/:name", function(req, res) {
	// Find the campground with provided ID, and then populating the comments on it
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
		if (err) {
			req.flash("error", "Page does not exist");
			res.redirect('back');
		}
		else {
			foundCampground.description = nl2br(foundCampground.description);
			res.render("campgrounds/show", { campground: foundCampground, title: foundCampground.name});
		}
	});
});


// EDIT CAMPGROUND ROUTE
router.get("/:id/:name/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if (err) {
			req.flash("error", "Campground not found");
			res.redirect('back');
		}
		else {
			res.render("campgrounds/edit", {campground: foundCampground, title: "Edit " + foundCampground.name});
		}
	});
});

// UPDATE CAMPGROUND ROUTE

router.put("/:id/:name", middleware.checkCampgroundOwnership, middleware.sanitize, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if (err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else {
			res.redirect("/campgrounds/" + req.params.id + "/" + req.params.name);
		}
	});
});

// DESTROY CAMPGROUND ROUTE

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}
		else {
			res.redirect("/campgrounds");
		}
	});
});


// =======================
// IS LOGGED IN MIDDLEWARE
// =======================

// function isLoggedIn(req, res, next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/login");
// }

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;