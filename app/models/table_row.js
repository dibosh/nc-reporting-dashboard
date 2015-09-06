var mongoose = require('mongoose');

var ssSchema = new mongoose.Schema({
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

var gettySchema = new mongoose.Schema({
  'type' : {type : String, default: ''},
  'taskID' : {type : String, default: ''},
  'publishDate' : { type: Date, default: Date.now },
  'organizationID' : {type : String, default: ''},
  'channel' : {type : String, default: ''},
  'NCImageGUID' : {type : String, default: ''},
  'GettyImageID' : {type : String, default: ''},
  'GettyCollectionID' : {type : String, default: ''}
});

module.exports = mongoose.model('ShutterStockRow', ssSchema);
module.exports = mongoose.model('GettyRow', gettySchema);