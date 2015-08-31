var tableRows = require('./routes/route_table_row.js');

module.exports = function(app) {
  // Backend routes
  app.use('/', tableRows);
  // Frontend routes
  app.get('/static/data', function(req, res) {
    res.sendfile('./public/assets/data.csv');
  });
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};