angular.module('Services')
  .factory('Reports', ['$http', function($http, $parse) {
  return {
    all : function () {
      return $http.get('/api/report/all');
    },

    allFromPage : function (pageNumber, pageSize) {
      return $http.get('/api/report/static/' + pageNumber + '/' + pageSize);
    }
  }
}])
  .factory('ReportsFrom', ['$http', function($http) {
    return {
      all : function() {
        return $http.get('/api/report/all');
      }
    }
  }]);