// Let's do the nasty way for now- don't separate to different files
angular.module('Controllers')
  .controller('MainController', function ($scope,
                                          Reports, $parse) {

    // Define if data will be fetched from DB or read from csv file directly
    var usingStaticFile = true;
    $scope.loading = { data : true };

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

    if (usingStaticFile) {
      Reports.allFromFile().then(function (res) {
        $scope.loading.data = false;
        // The file is big and fetch it in worker thread
        Papa.parse(res.data, {
          header: true,
          complete: function(results) {
            $scope.rows = _.map(results.data, function (row) {
              row.taskPublishDate = new Date(row.taskPublishDate);
              row.licensedDate = new Date(row.licensedDate);
              return row;
            });
            _setupData();
          }
        });
      });
    } else {
      Reports.all().then(function (res) {
        $scope.loading.data = false;
        // Sorted rows- latest one should be the first
        $scope.rows = _.map(res.data, function (row) {
          row.taskPublishDate = new Date(row.taskPublishDate);
          row.licensedDate = new Date(row.licensedDate);
          return row;
        });
        _setupData();
      });
    }

    var _setupData = function () {
      var latestRecord = $scope.rows[0];
      var oldestRecord = $scope.rows[$scope.rows.length - 1];
      $scope.reportTime = Date.now();
      $scope.startPublishDate = new Date(oldestRecord.taskPublishDate);
      $scope.endPublishDate = new Date(latestRecord.taskPublishDate);
      $scope.startLicensedDate = new Date(oldestRecord.licensedDate);
      $scope.endLicensedDate = new Date(latestRecord.licensedDate);
      // Add some buffer of about 2 months
      $scope.startPublishDate.setMonth($scope.startPublishDate.getMonth() - 1);
      $scope.endPublishDate.setMonth($scope.endPublishDate.getMonth() + 1);
      $scope.startLicensedDate.setMonth($scope.startLicensedDate.getMonth() - 1);
      $scope.endLicensedDate.setMonth($scope.endLicensedDate.getMonth() + 1);
    };
  });
