angular.module('Controllers')
.controller('OverviewCtrl', function ($scope, Reports) {
    var _fetchData = function (callback) {
      Reports.fromFile().forAllProviders()
        .then(callback);
    };

    $scope.providerData = {};
    $scope.loading = {};
    $scope.providerKeys = [];

    var _init = function () {
      $scope.loading.data = true;
      $scope.totalUsage = 0;
      _fetchData(0, function (res) {
        $scope.loading.data = false;
        // Do some housekeeping on each rows
        for (index in res.data) {
          $scope.providerKeys.push(res.data[index].providerKey);
          $scope.providerData.totalUsage += res.data[index].records.length;
          $scope.providerData.records[res.data[index].providerKey] = res.data[index].records;
        }

      });
    };

    _init();
  });