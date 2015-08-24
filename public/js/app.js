angular.module('ReportingServices', []);

// The application
var application = angular.module('ReportingDashboard',
  [
    'ReportingServices',
    'ngRoute'
  ]
);


// Basic controllers & logicsßßß
// Let's do the nasty way for now- don't separate to different files
application
  .controller('MainController', function ($scope,
                                          Reports) {
    $scope.searchText = '';
    $scope.tableHeaders = [
      'Task',
      'Organization',
      'Task Publish Date',
      'Channel',
      'NC Image GUID',
      'Shutterstock Image ID',
      'Licensed Date'
    ];

    Reports.all().then(function (res) {
      $scope.rows = res.data;
    });
    $scope.reportTime = Date.now();
  });




// Routes
application.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

  $routeProvider
    .when('/home', {
      templateUrl: 'views/home.html',
      controller: 'MainController'
    })

  $locationProvider.html5Mode(true);

}]);

