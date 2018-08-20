'use strict';

const mongoose   = require('mongoose'),
	  Campground = require('./models/campground'),
	  Comment    = require('./models/comment');

let data = [
	{
		name: "Cloud's Rest",
		image: "https://farm8.staticflickr.com/7334/27411429115_941298182b.jpg",
		description: "Barque mizzenmast cog take a caulk boatswain code of conduct plunder man-of-war run a rig. American Main Arr yo-ho-ho piracy avast draught bowsprit splice the main brace Brethren of the Coast. Transom spike list squiffy league interloper gangway hearties smartly. Jack Tar hardtack killick belay holystone mizzen keel to go on account bilge."
	},
	{
		name: "Desert Mesa",
		image: "https://farm5.staticflickr.com/4280/35363102462_19c9a5b1ee.jpg",
		description: "Barque mizzenmast cog take a caulk boatswain code of conduct plunder man-of-war run a rig. American Main Arr yo-ho-ho piracy avast draught bowsprit splice the main brace Brethren of the Coast. Transom spike list squiffy league interloper gangway hearties smartly. Jack Tar hardtack killick belay holystone mizzen keel to go on account bilge."
	},
	{
		name: "Night's Dream",
		image: "https://farm8.staticflickr.com/7345/10177921234_48e0ce929f.jpg",
		description: "Barque mizzenmast cog take a caulk boatswain code of conduct plunder man-of-war run a rig. American Main Arr yo-ho-ho piracy avast draught bowsprit splice the main brace Brethren of the Coast. Transom spike list squiffy league interloper gangway hearties smartly. Jack Tar hardtack killick belay holystone mizzen keel to go on account bilge."
	}

]


function seedDB(){
	// Remove all campgrounds
	Campground.remove( {}, function(err){
		if(err) {
			console.log(err);
		}
		else {
			console.log("...Removed campgrounds");
			// Add new campgrounds
			data.forEach(function(seed){
				Campground.create(seed, function(err, campground){
					if(err) {
						console.log(err);
					}
					else {
						console.log("...added a campground!");
						// Add new comments
						Comment.create({
							text: "This place is great, but I wish there was Internet.",
							author: "Homer"
						}, function(err, comment){
							if(err) {
								console.log(err);
							}
							else {
								campground.comments.push(comment);
								campground.save();
								console.log("...created new comment!");
							}
						});
					};
				});
			});
		}
	});
}

module.exports = seedDB;