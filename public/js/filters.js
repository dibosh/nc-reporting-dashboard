angular.module('Filters')
  .filter('dateRangeFilter', function () {
    return function (items, dateProp, startDate, endDate) {
      return _.filter(items, function(item) {
        if (!startDate || !endDate) { return true; }
        var publishTime = new Date(item[dateProp]).getTime();
        return startDate.getTime() <= publishTime && publishTime <= endDate.getTime();
      });
    };
  })
  .filter('highlight', function($sce) {
    return function(text, phrase) {
      if(typeof text !== 'string') return;
      if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
        '<span class="highlighted">$1</span>')

      return $sce.trustAsHtml(text)
    }
  })