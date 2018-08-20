'use strict';

const mongoose              = require('mongoose'),
	  passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	  	username: { type: String, unique: true, required: true },
	  	firstName: String,
	  	lastName: String,
	  	password: String,
	  	email: { type: String, unique: true, required: true },
	  	avatar: String,
	  	resetPasswordToken: String,
	  	resetPasswordExpires: Date,
	  	isAdmin: {type: Boolean, default: false}
	  });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);