'use strict';

const express        = require("express"),
	  app            = express(),
	  bodyParser     = require("body-parser"),
	  expressSanitzer = require("express-sanitizer"),
      mongoose       = require("mongoose"),
      flash          = require("connect-flash"),
      session        = require("express-session"),
      MongoStore     = require('connect-mongo')(session),
      Campground     = require("./models/campground"),
      Comment        = require("./models/comment"),
      User           = require("./models/user"),
      seedDB	     = require("./seeds"),
      methodOverride = require("method-override"),
      passport       = require("passport"),
      LocalStrategy  = require("passport-local");
	

// Requiring Routes
const commentRoutes    = require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  authRoutes       = require("./routes/index");

let title = "";

const url = process.env.DATABASEURL || "localhost://mongodb://localhost:27017/yelp_camp";

mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitzer());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB(); // seed the database
app.locals.moment = require("moment"),

// Passport Configuration
// app.use(require('express-session')({
// 	secret: "this is the ultimate secret",
// 	resave: false,
// 	saveUninitialized: false
// }));

app.use(session({
	secret: "this is the ultimate secret",
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({
		url: process.env.DATABASEURL,
		ttl: 14 * 24 * 60 * 60, // = 14 days. Default
	})
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.enable('trust proxy');

app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


// Server listen
app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("YelpCamp server started...");
});