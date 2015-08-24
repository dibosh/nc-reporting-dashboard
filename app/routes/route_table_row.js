var express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'), // Parses information from POST
  methodOverride = require('method-override'),
  tableRow = require('./../models/table_row.js'), // Import the model
  mongoose = require('mongoose');

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