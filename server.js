// Modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');

// Config files
var db = require('./config/db');

// Set our port
var port = process.env.PORT || 8080;

// Connect to our mongoDB database
mongoose.connect(db.url);

// Get all data/stuff of the body (POST) parameters
// Parse application/json
app.use(bodyParser.json());

// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// Set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// Routes ==================================================
require('./app/routes')(app); // Configure our routes

// Start app ===============================================
// Startup our app at http://localhost:8080
app.listen(port);
console.log('Running app on ' + port);
// Expose app
exports = module.exports = app;