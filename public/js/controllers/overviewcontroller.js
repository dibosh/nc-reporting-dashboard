angular.module('Controllers')
.controller('OverviewCtrl', function ($scope, Reports, $filter) {
    var _fetchData = function (callback) {
      Reports.fromFile().forAllProviders()
        .then(callback);
    };

    $scope.rawData = {};

    var _components = [
      'views/components/godview.html',
      'views/components/orgdetailview.html'
    ];

    $scope.shownComponent = _components[0];

    $scope.loading = {};
    $scope.providerDateFilters = {
      Shutterstock: 'taskPublishDate',
      Getty: 'publishDate'
    };
    $scope.providerKeys = [ 'Shutterstock', 'Getty' ];

    // Setup initial date range
    $scope.startPublishDate = new Date();
    $scope.endPublishDate = new Date();

    $scope.startPublishDate.setMonth($scope.startPublishDate.getMonth() - 2); // The start date should be another month prior to end date
    $scope.endPublishDate.setMonth($scope.endPublishDate.getMonth() - 1); // The end date should be from last month
    $scope.reportTime = $scope.endPublishDate;

    $scope.recordsGroupedByOrg = [];

    $scope.rows = []; // The actual data to be shown as list

    var isFirstTimeFetch = true; // If the data is being fetched for the first time

    $scope.selectedItemIndex = -1;

    $scope.deselectItem = function () {
      if ($scope.selectedItem){
        $scope.selectedItem = null;
        $scope.selectedItemIndex = -1;
        $scope.shownComponent = _components[0];
      }
    }

    $scope.selectItem = function (index) {
      $scope.selectedItemIndex = index;
      $scope.selectedItem = $scope.rows[Object.keys($scope.rows)[index]];
      _.forEach ($scope.providerKeys, function (provider) {
        $scope.selectedItem[provider.title] = _order($scope.selectedItem[provider.title], '-' + provider.dateFilter);
      });

      var endRange = new Date($scope.startPublishDate.getTime() + 10 * 24 * 3600 * 1000);
      var startRange = $scope.startPublishDate;

      // Show detailed view
      if ($scope.selectedItem) $scope.shownComponent = _components[1];
     };

    var _order = function(array, predicate) {
      return $filter('orderBy')(array, predicate, false);
    };
    // Pagination Control
    $scope.currentPage = 1;
    $scope.pageSize = 15;
    $scope.visiblePages = 5;

    $scope.pageChanged = function () {

    }

    var _setupDataCallback = function (res) {
      $scope.loading.data = false;
      $scope.rawData = res.data;

      // Merge records from all the providers and then group them by org ids
      var mergedProviderRecords = _.reduce($scope.rawData, function(result, item) { return result.concat(item.records); }, []);
      $scope.totalImageUsage = mergedProviderRecords.length;
      var recordsGroupedByOrg = _.groupBy(mergedProviderRecords, function(item) { return item.organizationID + ':' + item.organizationName; });

      _.forEach(recordsGroupedByOrg, function (singleRecord) {
        _.forEach($scope.providerKeys, function (provider) {
          var recordsGroupedByProvider = _.filter(singleRecord, function(item) {
            return _.has(item, provider + 'ImageID');
          });
          singleRecord[provider] = recordsGroupedByProvider;
        });
      });

      // Let's clean the unnecessary objects from the record
      _.map(recordsGroupedByOrg, function (singleRecord) {
        for (key in singleRecord) {
          if (!_.contains($scope.providerKeys, key) && key !== 'totalUsage') delete singleRecord[key];
        }
        return singleRecord;
      });

      // We need to put in the org name in those provider wise grouped arrays
      for (key in recordsGroupedByOrg) {
        var parts = key.split(':');
        var orgID = parts[0];
        var orgName = parts[1];
        recordsGroupedByOrg[key].organizationID = orgID;
        recordsGroupedByOrg[key].organizationName = orgName;
      }

      $scope.rows = recordsGroupedByOrg;

      console.log($scope.rows);

      // Set the selected item
      $scope.selectedItem = $scope.rows[Object.keys($scope.rows)[0]];

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

    // Graph settings
    $scope.chartLabels = ["01/7/15", "01/7/15", "01/8/15", "01/7/15", "01/7/15"];
    $scope.chartData = [
      [1, 2, 3, 4, 5],
      [6, 0, 3, 4, 5],
    ];
    $scope.chartOptions = {
      scaleBeginAtZero : true,
      scaleOverride: true,
      scaleSteps: 5,
      scaleStepWidth: 1
    };
  });