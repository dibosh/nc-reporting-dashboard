angular.module('Services')
  .factory('Reports', ['$http', function($http) {
  return {
    all : function () {
      return $http.get('/api/report/all');
    },

    allFromFile : function () {
      return $http.get('/static/data');
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