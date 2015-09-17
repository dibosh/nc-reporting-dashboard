angular.module('Controllers')
.controller('OverviewCtrl', function ($scope, Reports) {
    var _fetchData = function (callback) {
      Reports.fromFile().forAllProviders()
        .then(callback);
    };

    $scope.providerData = {
      totalUsage: 0,
      records: {}
    };

    $scope.loading = {};
    $scope.providerKeys = ['Shutterstock', 'Getty'];

    // Setup initial date range
    $scope.startPublishDate = new Date();
    $scope.endPublishDate = new Date();

    $scope.startPublishDate.setMonth($scope.startPublishDate.getMonth() - 2); // The start date should be another month prior to end date
    $scope.endPublishDate.setMonth($scope.endPublishDate.getMonth() - 1); // The end date should be from last month
    $scope.reportTime = $scope.endPublishDate;

    $scope.recordsGroupedByOrg = [];

    $scope.rows = [];

    var _setupDataCallback = function (res) {
      $scope.loading.data = false;

      // Merge records from all the providers and then group them by org ids
      var mergedProviderRecords = _.reduce(res.data, function(result, item) { return result.concat(item.records); }, []);
      $scope.totalImageUsage = mergedProviderRecords.length;
      var recordsGroupedByOrg = _.groupBy(mergedProviderRecords, function(item) { return item.organizationID; });

      console.log(recordsGroupedByOrg);


      _.forEach(recordsGroupedByOrg, function (singleRecord) {
        _.forEach($scope.providerKeys, function (provider) {
          var recordsGroupedByProvider = _.filter(singleRecord, function(item) {
            return _.has(item, provider + 'ImageID');
          });
          singleRecord[provider] = recordsGroupedByProvider;
        });
      });

      // Let's clean the shit up a bit
      recordsGroupedByOrg = _.map(recordsGroupedByOrg, function (singleRecord) {
        for (key in singleRecord) {
          if (!_.contains($scope.providerKeys, key)) delete singleRecord[key];
        }
        return singleRecord;
      });

      console.log(recordsGroupedByOrg);

      var col_width = Math.floor(12/($scope.providerKeys.length + 1)); // One extra for total usage column
      $scope.columnClass = 'col-md-' + col_width;

      // Add some buffer of about 1 month
      $scope.startPublishDate.setMonth($scope.startPublishDate.getMonth() - 1);


    };

    // Date range validation
    $scope.$watch(function (scope) {
        return scope.startPublishDate
      },
      function (newValue, oldValue) {
        if (newValue && newValue.getTime() > $scope.endPublishDate.getTime()) {
          $scope.startPublishDate = oldValue;
        } else {
          $scope.startPublishDate = newValue;
        }
      }
    );

    $scope.$watch(function (scope) {
        return scope.endPublishDate
      },
      function (newValue, oldValue) {
        var today = new Date();
        if ((newValue && newValue.getTime() < $scope.startPublishDate.getTime()) || (newValue && newValue.getTime() > today.getTime())) {
          $scope.endPublishDate = oldValue;
        } else {
          $scope.endPublishDate = newValue;
        }
      }
    );


    var _init = function () {
      $scope.loading.data = true;
      $scope.totalUsage = 0;
      _fetchData(_setupDataCallback);
    };

    // Start the armageddon
    _init();
  });