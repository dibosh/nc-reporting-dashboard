angular.module('Filters')
  .filter('dateRangeFilter', function () {
    return function (items, dateProp, startDate, endDate) {
      return _.filter(items, function(item) {
        var publishTime = new Date(item[dateProp]).getTime();
        return startDate.getTime() <= publishTime && publishTime <= endDate.getTime();
      });
    };
  });