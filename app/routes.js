var reportingAPI = require('./routes/route_reportsapi.js');

module.exports = function(app) {
  // Backend routes
  app.use('/', reportingAPI);
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};