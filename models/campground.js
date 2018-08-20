'use strict';

const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema({
	name: String,
	price: String,
	image: String,
	description: String,
	createdAt: {
		type: Date,
		default: Date.now
	},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String,
		isAdmin: {type: Boolean, default: false}
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Campground", campgroundSchema);