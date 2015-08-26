angular.module('ReportingServices', []);

// The application
var application = angular.module('ReportingDashboard',
  [
    'ReportingServices',
    'ui.bootstrap',
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

    // Datepicker controls
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
      $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.open = function($event) {
      $scope.status.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    $scope.status = {
      opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 2);
    $scope.events =
      [
        {
          date: tomorrow,
          status: 'full'
        },
        {
          date: afterTomorrow,
          status: 'partially'
        }
      ];

    $scope.getDayClass = function(date, mode) {
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0,0,0,0);

        for (var i=0;i<$scope.events.length;i++){
          var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }

      return '';
    };
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

