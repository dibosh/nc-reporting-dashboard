var express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'), // Parses information from POST
  methodOverride = require('method-override'),
  tableRow = require('./../models/table_row.js'), // Import the model
  mongoose = require('mongoose'),
  fs = require('fs'),
  converter = require("csvtojson").Converter,
  path = require('path'),
  nodeCache = require("node-cache"),
  _ = require('lodash-node'),
  Promise = require('promise');

var serverCache = new nodeCache();
var providers = [
  {
    key: 'shutterStock',
    filePath: '../../public/assets/shutterstock_data.csv'
  },
  {
    key: 'getty',
    filePath: '../../public/assets/getty_data.csv'
  }
];

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // Look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

router.route('/api/report/all')
  // GET all rows
  .get(function (req, res) {
    // Retrieve all rows from Mongo
    mongoose.model('ShutterStockRow').find({}, function (err, rows) {
      if (err)
        res.send(err);
      res.json(rows);
    });

  });

function produceJSONFromCSV(provider) {
  var cacheKey = providers[provider].key;
  var data = serverCache.get(cacheKey);
  var promise = undefined;

  if ( data == undefined ){
    var csvConverter = new converter({constructResult: true});
    var filePath = path.join(__dirname, providers[provider].filePath);
    var fileStream = fs.createReadStream(filePath);

    promise = new Promise(function (resolve, reject) {
      csvConverter.on('end_parsed', function (parsedResponse) {
        data = {
          providerKey: cacheKey,
          records: parsedResponse
        };
        var success = serverCache.set(cacheKey, data);
        if (success) console.log('Saved to cache...');
        resolve(data);
      });
    });

    fileStream.pipe(csvConverter); // Start reading and parsing
  } else{
    promise = new Promise(function (resolve, reject) {
      console.log('Retrieved from cache. Sending response...');
      resolve(data);
    });
  }

  return promise;
}

// Get all the records for all the providers
// Use with care; heavy load on server
router.route('/api/report/static/all')
  .get(function (req, res) {
    var promises = [];

    for (provider in providers) {
      promises.push(produceJSONFromCSV(provider));
    }

    Promise.all(promises)
      .then(function (jsonArray) {
        res.send(jsonArray);
      });
  });

// Return records for specific provider
router.route('/api/report/static/all/:provider')
  // GET all rows
  .get(function (req, res) {
    produceJSONFromCSV(req.params.provider).then(function (jsonObj) {
      // Send the response
      res.send(jsonObj);
    });
  });

router.route('/api/report/static/:provider/:pageno/:pagesize')
  // GET all rows withing this page
  .get(function (req, res) {
    produceJSONFromCSV(req.params.provider).then(function (jsonObj) {
      // Send the response
      res.send({
        providerKey: jsonObj.providerKey,
        total: jsonObj.records.length,
        pageNo: req.params.pageno,
        pageData: _.chunk(jsonObj.records, req.params.pagesize)[req.params.pageno - 1]
      });
    });
  });

module.exports = router;