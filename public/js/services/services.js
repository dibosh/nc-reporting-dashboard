angular.module('ReportingServices').factory('Reports', ['$http', function($http) {
  return {
    all : function() {
      return $http.get('/api/report/all');
    }
  }
}]);