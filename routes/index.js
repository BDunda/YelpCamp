'use strict';

const express    = require("express"),
	  passport   = require("passport"),
	  async      = require("async"),
	  crypto     = require("crypto"), // Already a part of node
	  nodemailer = require("nodemailer"),
	  User       = require("../models/user"),
	  middleware = require("../middleware");

const router = express.Router({ mergeParams: true });


var referedUrl = "/";

// ==========
// ROOT ROUTE
// ==========

router.get("/", function(req, res) {
	res.render("landing", { title: "YelpCamp Landing Page" });
});


// ===========
// AUTH ROUTES
// ===========

// Show register form
router.get("/register", function(req, res){
	res.render("register", {page: 'register', title: "Sign-up Page"});
});


// Register New User
router.post("/register", function(req, res){
	const newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email
	});
	User.register(newUser, req.body.password, function(err, user){
		if(err) {
			//req.flash("error", err.message);
			//return res.render("register", {title: "Sign-up page"});
			return res.render("register", {"error": err.message, title: "Sign-up page"});
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to YelpCamp, " + user.username + "!");
			res.redirect("/campgrounds");
		});
	})
});



// Show login form
router.get("/login", function(req, res){
	let loginUrl = req.protocol + '://' + req.get('host') + "/login", // Builds the current URL string
		registerUrl = req.protocol + '://' + req.get('host') + "/register";

		console.log(loginUrl);
		console.log(registerUrl);
		console.log(req.get('referer'));


		if (req.get('referer') != loginUrl && req.get('referer') != registerUrl ){
			referedUrl = req.get('referer'); // Gets the current page so the user can be redirected back if logged in
		}

	res.render("login", {page: 'login', title: "Login"});
});

// Handling login logic
router.post("/login", passport.authenticate("local", {
		//successRedirect: referedUrl,
		failureRedirect: "/login",
		failureFlash: true
	}), function(req, res){
	if (!referedUrl) {
		// If previous page is undefined, such as login access via address bar, redirect to campgrounds
		res.redirect("/campgrounds");
	}
	else {
		res.redirect(referedUrl);
		referedUrl = "/"; //resets referedUrl to root
	}
});


// logout
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged out")
	res.redirect("/campgrounds");
});

// FORGOT PASSWORD

router.get("/forgot", function(req, res){
	res.render('forgot', { title: "Forgot Password" });
});

router.post("/forgot", function(req, res, next){
	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err, buf){
				let token = buf.toString('hex');
				done(err, token);
			});
		},
		// Look up submitted email and assign a temporary token
		function(token, done){
			User.findOne({ email: req.body.email }, function(err, foundEmail){
				if(!foundEmail) {
					req.flash("error", "No account with that email address exists");
					return res.redirect("/forgot");
				}

				foundEmail.resetPasswordToken = token;
				foundEmail.resetPasswordExpires = Date.now() + 3600000; // One hour in milliseconds

				foundEmail.save(function(err){
					done(err, token, foundEmail);
				});
			});
		},
		// Send Email
		function(token, foundEmail, done) {
			let smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'orange.kun@gmail.com',
					pass: process.env.GMAILPW
				}
			});
			let mailOptions = {
				to: foundEmail.email,
				from: 'orange.kun@gmail.com (Do not reply!)',
				subject: 'Password reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};

			smtpTransport.sendMail(mailOptions, function(err){
				console.log('Mail sent');
				req.flash('success', 'An email has been sent to ' + foundEmail.email + '.');
				done(err, 'done');
			});
		}
	], function(err){
		if (err) return next(err);
		res.redirect('/forgot');
	});
});


router.get("/reset/:token", function(req, res){
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, foundUser){
		if(!foundUser){
			req.flash('error', 'Password reset token is invalid or has expired.');
			return res.redirect('/forgot');
		}
		res.render('reset', { token: req.params.token, title: 'Reset Password' });
	});
});

router.post("/reset/:token", function(req, res){
	async.waterfall([
		function(done){
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, foundUser) {
				if(!foundUser) {
					req.flash('error', 'Password reset token is invalid or has expired.');
					return res.redirect('back');
				}
				if (req.body.password === req.body.confirm) {
					foundUser.setPassword(req.body.password, function(err){
						// Makes the password token undefined so it is inaccessible after password change
						foundUser.resetPasswordToken = undefined;
						foundUser.resetPasswordExpires = undefined;

						foundUser.save(function(err){
							req.logIn(foundUser, function(err){ //Logs user in automatically
								done(err, foundUser);
							});
						});
					});
				}
				else {
					req.flash('error', "Passwords do not match.");
					return res.redirect('back');
				}
			});
		}, function(foundUser, done){
			let smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'orange.kun@gmail.com',
					pass: process.env.GMAILPW
				}
			});
			let mailOptions = {
				to: foundUser.email,
				from: 'orange.kun@gmail.com (do not reply)',
				subject: 'Your password has been changed',
				text: 'Hello \n\n' +
				'This is a confirmation that the password for your account ' + foundUser.email + ' has just been changed.'
			};
			smtpTransport.sendMail(mailOptions, function(err){
				req.flash('success', "Your password has been changed.")
				done(err);
			});
		}
	], function(err){
		res.redirect('/campgrounds');
	});
});



// =================
// PUBLIC USER PROFILE PAGE
// =================

router.get("/users/:id", function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if (err) {
			req.flash("error", "There was an error processing that request");
			res.redirect("/campgrounds");
		}
		else {
				res.render("user", {user: foundUser, title: foundUser.username + "'s Profile Page" });
		}
	});
});



// =================
// PRIVATE USER PROFILE PAGE
// =================

router.get("/user/:id", middleware.isLoggedIn, function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		let currentUser = req.user._id;
		if (err) {
			req.flash("error", "There was an error processing that request");
			res.redirect("/campgrounds");
		}
		else {
				let requestedUserPage = foundUser.id;
				// Check if the user making the request is the same ID as the requested page,
				// and if the current user is an Admin or not
	 			if(currentUser != requestedUserPage && !req.user.isAdmin) {
	 				req.flash("error", "You do not have permission to access this page");
					res.redirect("/campgrounds"); // No access
				}
			 	else {
			 		res.render("user", {user: foundUser, title: foundUser.username + "'s Profile Page" });
			 	}
			 // }
		}
	});
});

module.exports = router;