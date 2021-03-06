'use strict';

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
	text: String,
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
	}
});

module.exports = mongoose.model("Comment", commentSchema)