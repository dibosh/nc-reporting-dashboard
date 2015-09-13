var express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'), // Parses information from POST
  methodOverride = require('method-override'),
  tableRow = require('./../models/table_row.js'), // Import the model
  mongoose = require('mongoose'),
  fs = require('fs'),
  converter = require("csvtojson").Converter,
  path = require('path'),
  nodeCache = require( "node-cache"),
  _ = require('lodash-node');

var serverCache = new nodeCache();
var SHUTTERSTOCK_CSV_JSON_DATA = 'shutterStock';
var GETTY_CSV_JSON_DATA = 'getty';

router.use(bodyParser.urlencoded( { extended: true } ));
router.use(methodOverride( function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // Look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

router.route('/api/report/all')
  // GET all rows
  .get(function(req, res) {
    // Retrieve all rows from Mongo
    mongoose.model('ShutterStockRow').find({}, function(err, rows) {
      if (err)
        res.send(err);
      res.json(rows);
    });

  });

var _parseCSV = function (provider, callback) {
  var csvConverter = new converter({constructResult:true});
  var filePath = path.join(__dirname, provider == 0 ? '../../public/assets/shutterstock_data.csv' : '../../public/assets/getty_data.csv');
  var fileStream = fs.createReadStream(filePath);
  // end_parsed will be emitted once parsing finished
  csvConverter.on('end_parsed', callback);
  fileStream.pipe(csvConverter); // Start reading and parsing
}

router.route('/api/report/static/all/:provider')
  // GET all rows
  .get(function(req, res) {
    // Retrieve all rows from CSV
    var provider = req.params.provider;
    var cacheKey = provider == 0 ? SHUTTERSTOCK_CSV_JSON_DATA : GETTY_CSV_JSON_DATA;
    var data = serverCache.get(cacheKey);

    if ( data == undefined ){
      _parseCSV(provider, function (jsonObj) {
        // Send the response
        data = {
          totalCount: jsonObj.length,
          raw: jsonObj
        };
        var success = serverCache.set(cacheKey, data);
        if (success){
          console.log('Saved to cache...');
          res.send(data);
        }
      });
    }else{
      console.log('Retrieved from cache. Sending response...');
      res.send(data);
    }
  });

router.route('/api/report/static/:provider/:pageno/:pagesize')
  // GET all rows
  .get(function(req, res) {
    // Retrieve all rows from csv
    var pageNo = req.params.pageno;
    var pageSize = req.params.pagesize;
    var provider = req.params.provider;
    var cacheKey = provider == 0 ? SHUTTERSTOCK_CSV_JSON_DATA : GETTY_CSV_JSON_DATA;
    var data = serverCache.get(cacheKey);

    if ( data == undefined ){
      _parseCSV(provider, function (jsonObj) {
        // Send the response
        data = {
          totalCount: jsonObj.length,
          raw: jsonObj
        };
        var success = serverCache.set(cacheKey, data);
        if (success){
          console.log('Saved to cache...');
          res.send({
            total: data.totalCount,
            pageNo: pageNo,
            pageData: _.chunk(data.raw, pageSize)[pageNo-1]
          });
        }
      });
    }else{
      console.log('Retrieved from cache. Sending response...');
      res.send({
        total: data.totalCount,
        pageNo: pageNo,
        pageData: _.chunk(data.raw, pageSize)[pageNo-1]
      });
    }
  });

// Route middleware to validate :id
router.param('id', function(req, res, next, id) {
  mongoose.model('ShutterStockRow').findById(id, function (err, row) {
    // If it isn't found, we are going to respond with 404
    if (err) {
      console.log(id + ' was not found');
      res.status(404)
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        json: function(){
          res.json({message : err.status  + ' ' + err});
        }
      });
    } else {
      console.log(row);
      req.id = id;
      next();
    }
  });
});

module.exports = router;