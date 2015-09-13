angular.module('Services', []);
angular.module('Filters', []);
angular.module('Controllers', []);
// The application
var application = angular.module('ReportingDashboard',
  [
    'Services',
    'Filters',
    'Controllers',
    'ui.bootstrap',
    'ngRoute',
  ]
)
  //.constant('_', window._);
// Routes
application.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

  $routeProvider
    .when('/home', {
      templateUrl: 'views/home.html',
      controller: 'BaseCtrl'
    })
    .otherwise({ redirectTo: '/home' });

  $locationProvider.html5Mode(true);

}]);

