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
var KEY_CSV_JSON_DATA = 'csvToJson';

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
    mongoose.model('TableRow').find({}, function(err, rows) {
      if (err)
        res.send(err);
      res.json(rows);
    });

  });

router.route('/api/report/static/:pageno/:pagesize')
  // GET all rows
  .get(function(req, res) {
    // Retrieve all rows from csv
    var pageNo = req.params.pageno;
    var pageSize = req.params.pagesize;
    var data = serverCache.get(KEY_CSV_JSON_DATA); // Check if the data is already cached
    if ( data == undefined ){
      var csvConverter = new converter({constructResult:true});
      var filePath = path.join(__dirname, '../../public/assets/data.csv');
      var fileStream = fs.createReadStream(filePath);
      // end_parsed will be emitted once parsing finished
      csvConverter.on('end_parsed', function (jsonObj) {
        // Send the response
        var data = {
          totalCount: jsonObj.length,
          raw: _.chunk(jsonObj, pageSize)
        };
        var success = serverCache.set(KEY_CSV_JSON_DATA, data);
        if (success){
          console.log('Saved to cache...');
          res.send({
            total: data.totalCount,
            pageNo: pageNo,
            pageData: data.raw[pageNo-1]
          });
        }
      });
      fileStream.pipe(csvConverter); // Start reading and parsing
    }else{
      console.log('Retrieved from cache. Sending response...');
      res.send({
        total: data.totalCount,
        pageNo: pageNo,
        pageData: data.raw[pageNo-1]
      });
    }
  });

// Route middleware to validate :id
router.param('id', function(req, res, next, id) {
  mongoose.model('TableRow').findById(id, function (err, row) {
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