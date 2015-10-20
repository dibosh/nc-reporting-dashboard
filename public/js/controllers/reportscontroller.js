// Let's do the nasty way for now- don't separate to different files
angular.module('Controllers')
  .controller('ReportsCtrl', function ($scope,
                                       Reports, $filter) {

    // Define if data will be fetched from DB or read from csv file directly
    var usingStaticFile = true;
    $scope.loading = {data: true};

    $scope.searchText = '';

    $scope.tableHeaders = [];

    $scope.providers = [
      {
        title: 'Shutterstock',
        dateFilter: 'taskPublishDate'
      },
      {
        title: 'Getty',
        dateFilter: 'publishDate'
      }
    ];

    $scope.visibleRange = {
      start: 0,
      end: 0
    };

    $scope.selectedProvider = 0;

    var tableHeadersShouldBeGenerated = true;

    // Date range setup
    $scope.startPublishDate = new Date();
    $scope.endPublishDate = new Date();

    $scope.startPublishDate.setMonth($scope.startPublishDate.getMonth() - 2); // The start date should be another month prior to end date
    $scope.endPublishDate.setMonth($scope.endPublishDate.getMonth() - 1); // The end date should be from last month
    $scope.reportTime = $scope.endPublishDate;


    $scope.selectProvider = function (index) {
      $scope.searchText = '';
      $scope.tableHeaders = [];
      isFirstTimeFetch = true;
      tableHeadersShouldBeGenerated = true;
      $scope.selectedProvider = index;
      _fetchData();
    }

    // Pagination Control
    $scope.currentPage = 1;
    $scope.pageSize = 15;
    $scope.visiblePages = 5;

    $scope.pageChanged = function () {
      _fetchData();
    }

    var isFirstTimeFetch = true; // If the data is being fetched for the first time

    var _fetchData = function () {
      Reports.fromFile().forProviderFromPageWithSize($scope.selectedProvider, $scope.currentPage, $scope.pageSize)
        .then(function (res) {
          $scope.loading.data = false;
          // Do some housekeeping on each rows
          $scope.rows = _.map(res.data.pageData, function (row) {
            var keyCounts = 0;
            for (key in row) {
              keyCounts++;
              if (key.toLowerCase().indexOf('date') > -1) row[key] = $filter('date')(new Date(row[key]), 'dd MMM, yyyy');
              // Any ID except images should be just deleted
              if (key.toLowerCase().indexOf('organizationid') > -1 || key.toLowerCase().indexOf('taskid') > -1) delete row[key]
              else if (tableHeadersShouldBeGenerated) $scope.tableHeaders.push(key);
            }
            $scope.widthPercentageForColumn = ((a = 100 / keyCounts) < 15 ? 15 : a) + '%';
            tableHeadersShouldBeGenerated = false;
            return row;
          });
          if (isFirstTimeFetch) {
            $scope.totalRows = res.data.total;
            isFirstTimeFetch = false;
          }
          _updateDynamicData();
        });
    };

    if (usingStaticFile) {
      _fetchData();
    }
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

    var _updateDynamicData = function () {
      $scope.dateRangeFilteringInput = $scope.providers[$scope.selectedProvider].dateFilter;
      $scope.orderByPredicate = '-' + $scope.dateRangeFilteringInput;

      if ($scope.currentPage == 1) $scope.visibleRange = {
        start: 0,
        end: 0
      }; // Reset
      $scope.visibleRange.start = $scope.visibleRange.end;
      $scope.visibleRange.end = $scope.visibleRange.start + $scope.rows.length;
    };

  });
