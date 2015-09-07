// Let's do the nasty way for now- don't separate to different files
angular.module('Controllers')
  .controller('MainController', function ($scope,
                                          Reports, $parse, $filter) {

    // Define if data will be fetched from DB or read from csv file directly
    var usingStaticFile = true;
    $scope.loading = { data : true };

    $scope.searchText = '';

    $scope.tableHeaders = [];
    // Provider selection
    //$scope.shutterStockHeaders = [
    //  'Article',
    //  'Organization',
    //  'Task Publish Date',
    //  'Publish Channel',
    //  'NC Image GUID',
    //  'Shutterstock Image ID',
    //  'Licensed Date'
    //];
    //
    //$scope.gettyHeaders = [
    //  'Article Task ID',
    //  'Organization',
    //  'Task Publish Date',
    //  'Publish Channel',
    //  'NC Image GUID',
    //  'Shutterstock Image ID',
    //  'Licensed Date'
    //];
    //$scope.templates = [
    //  'views/components/shutterstock-report.html',
    //  'views/components/getty-report.html'
    //];

    $scope.providers = [
      'ShutterStock',
      'Getty'
    ];

    $scope.visibleRange = {
      start: 0,
      end: 0
    };

    $scope.selectedProvider = 0;

    var tableHeadersShouldBeGenerated = true;

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
      Reports.allFromPage($scope.selectedProvider, $scope.currentPage, $scope.pageSize).then(function (res) {
        $scope.loading.data = false;
        // Do some housekeeping on each rows
        $scope.rows = _.map(res.data.pageData, function (row) {
          var keyCounts = 0;
          for (key in row){
            keyCounts++;
            if(key.toLowerCase().indexOf('date') > -1) row[key] = $filter('date')(new Date(row[key]), 'dd MMM, yyyy');
            // Any ID except images should be just deleted
            if(key.toLowerCase().indexOf('organizationid') > -1 || key.toLowerCase().indexOf('taskid') > -1) delete row[key]
            else if(tableHeadersShouldBeGenerated) $scope.tableHeaders.push(key);
          }
          $scope.widthPercentageForColumn = ((a = 100/keyCounts) < 15 ? 15 : a) + '%';
          tableHeadersShouldBeGenerated = false;
          return row;
        });
        if (isFirstTimeFetch){
          $scope.totalRows = res.data.total;
          isFirstTimeFetch = false;
        }
        _setupData();
      });
    };

    if (usingStaticFile) {
      _fetchData();
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
    // Date range validation
    $scope.$watch(function(scope) { return scope.startPublishDate },
      function(newValue, oldValue) {
        if (newValue && newValue.getTime() > $scope.endPublishDate.getTime()){
          $scope.startPublishDate = oldValue;
        }else{
          $scope.startPublishDate = newValue;
        }
      }
    );

    $scope.$watch(function(scope) { return scope.endPublishDate },
      function(newValue, oldValue) {
        if (newValue && newValue.getTime() < $scope.startPublishDate.getTime()){
          $scope.endPublishDate = oldValue;
        }else{
          $scope.endPublishDate = newValue;
        }
      }
    );

    var _setupData = function () {
      $scope.dateRangeFilteringInput = $scope.selectedProvider == 0 ? 'taskPublishDate' : 'publishDate';
      $scope.orderByPredicate = '-' + $scope.dateRangeFilteringInput;
      var latestRecord = $scope.rows[0];
      var oldestRecord = $scope.rows[$scope.rows.length - 1];
      $scope.startPublishDate = new Date(oldestRecord.taskPublishDate || oldestRecord.publishDate);
      $scope.endPublishDate = new Date(latestRecord.taskPublishDate || latestRecord.publishDate);
      // Add some buffer of about 2 months
      $scope.startPublishDate.setMonth($scope.startPublishDate.getMonth() - 1);
      $scope.endPublishDate.setMonth($scope.endPublishDate.getMonth() + 1);

      $scope.reportTime = $scope.endPublishDate;

      if($scope.currentPage == 1) $scope.visibleRange = {
        start: 0,
        end: 0
      }; // Reset
      $scope.visibleRange.start = $scope.visibleRange.end;
      $scope.visibleRange.end = $scope.visibleRange.start + $scope.rows.length;
    };
  });
