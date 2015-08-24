var mongoose = require('mongoose');

//var schema = new mongoose.Schema({
//  'Task Title' : {type : String, default: ''},
//  'Task ID' : {type : String, default: ''},
//  'Task Publish Date' : { type: Date, default: Date.now },
//  'Organization Name' : {type : String, default: ''},
//  'Organization ID' : {type : String, default: ''},
//  'Channel' : {type : String, default: ''},
//  'NC Image GUID' : {type : String, default: ''},
//  'Shutterstock Image ID' : {type : String, default: ''},
//  'Licensed Date' : { type: Date, default: Date.now }
//});

var schema = new mongoose.Schema({
  'taskTitle' : {type : String, default: ''},
  'taskID' : {type : String, default: ''},
  'taskPublishDate' : { type: Date, default: Date.now },
  'organizationName' : {type : String, default: ''},
  'organizationID' : {type : String, default: ''},
  'channel' : {type : String, default: ''},
  'NCImageGUID' : {type : String, default: ''},
  'ShutterstockImageID' : {type : String, default: ''},
  'licensedDate' : { type: Date, default: Date.now }
});

module.exports = mongoose.model('TableRow', schema);