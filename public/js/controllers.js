// Let's do the nasty way for now- don't separate to different files
angular.module('Controllers')
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
      // Sorted rows- latest one should be the first
      $scope.rows = _.sortByOrder(res.data, function (row) {
        return new Date(row.taskPublishDate).getTime();
      }, ['desc']);

      _setupData();
    });

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
    }
  });
